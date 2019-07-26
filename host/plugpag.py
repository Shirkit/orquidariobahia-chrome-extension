# -*- coding: UTF-8 -*-

import ctypes
import transaction
import json

APP_NAME = b'PlugPagPython'
APP_VERSION = b'1.0.0'
BLUETOOTH_PORT = b'COM4'

ENCODING = 'utf-8'

"""
PagSeguro Docs Value

enPPPSPaymentMethod
"""
PPPAGSEGURO_CREDIT = 1
PPPAGSEGURO_DEBIT = 2
PPPAGSEGURO_VOUCHER = 3

"""
enPPPSInstallmentType
"""
PPPAGSEGURO_A_VISTA = 1
PPPAGSEGURO_PARC_VENDEDOR = 2


"""
Transaction result structure.
"""


class TransactionResult(ctypes.Structure):
    _fields_ = [('rawBuffer', ctypes.ARRAY(65543, ctypes.c_char)),
                ('message', ctypes.ARRAY(1024, ctypes.c_char)),
                ('transactionCode', ctypes.ARRAY(33, ctypes.c_char)),
                ('date', ctypes.ARRAY(11, ctypes.c_char)),
                ('time', ctypes.ARRAY(9, ctypes.c_char)),
                ('hostNsu', ctypes.ARRAY(13, ctypes.c_char)),
                ('cardBrand', ctypes.ARRAY(31, ctypes.c_char)),
                ('bin', ctypes.ARRAY(7, ctypes.c_char)),
                ('holder', ctypes.ARRAY(5, ctypes.c_char)),
                ('userReference', ctypes.ARRAY(11, ctypes.c_char)),
                ('terminalSerialNumber', ctypes.ARRAY(66, ctypes.c_char))]

    def toDictionary(self):
        return {
            'transactionCode': self.transactionCode.decode(ENCODING),
            'date': self.date.decode(ENCODING),
            'time': self.time.decode(ENCODING),
            'hostNsu': self.hostNsu.decode(ENCODING),
            'cardBrand': self.cardBrand.decode(ENCODING),
            'bin': self.bin.decode(ENCODING),
            'holder': self.holder.decode(ENCODING),
            'userReference': self.userReference.decode(ENCODING),
            'terminalSerialNumber': self.terminalSerialNumber.decode(ENCODING),
        }


"""
Loads the DLLs and returns the DLLs references to call PlugPag methods.
"""


def loadLibraries():
    ppLib = ctypes.cdll.LoadLibrary('lib/PPPagSeguro.dll')
    ctypes.cdll.LoadLibrary('lib/BTSerial.dll')
    ctypes.cdll.LoadLibrary('lib/PlugPag.dll')

    return ppLib


"""
Initializes PlugPag parameters to allow transactions.
"""


def initPlugPag(pagSeguroLib):
    # print('Definindo nome e versao da aplicacao... ', end = '')
    pagSeguroLib.SetVersionName(APP_NAME, APP_VERSION)
    # print('OK')

    # print('Configurando conexao bluetooth... ', end = '')
    pagSeguroLib.InitBTConnection(BLUETOOTH_PORT)
    # print('OK')


"""
Prints a transaction's result.
"""


def printResult(resultCode, transactionResult):
    print('+-------------------------------------------------------------')

    if resultCode.value != 0:
        print('| Result:  {}'.format(resultCode.value))

    if len(transactionResult.message) > 0:
        print('| Message: {}'.format(transactionResult.message.decode(ENCODING)))

    print('+-------------------------------------------------------------')

    if resultCode.value == 0:
        print('| Transaction code:       {}'.format(transactionResult.transactionCode.decode(ENCODING)))
        print('| Date:                   {}'.format(transactionResult.date.decode(ENCODING)))
        print('| Time:                   {}'.format(transactionResult.time.decode(ENCODING)))
        print('| Host NSU:               {}'.format(transactionResult.hostNsu.decode(ENCODING)))
        print('| Card brand:             {}'.format(transactionResult.cardBrand.decode(ENCODING)))
        print('| Bin:                    {}'.format(transactionResult.bin.decode(ENCODING)))
        print('| Holder:                 {}'.format(transactionResult.holder.decode(ENCODING)))
        print('| User reference:         {}'.format(transactionResult.userReference.decode(ENCODING)))
        print('| Terminal serial number: {}'.format(transactionResult.terminalSerialNumber.decode(ENCODING)))
        print('+-------------------------------------------------------------')


"""
Main method.

OPTIONS is a Dictionary that has the following propeties

action  - Specifies which action should be taken. Options not listed are not supported
            - 'pay' for doing payments

payment - if 'action' is 'pay', then it expects more information about the payment
            ALL values must be STRINGs

'paymentMethod' can have two value: 'credit' or 'debit'.

'installment' is the number of 'parcelas' for this given payment.  ONLY IF "paymentMethod" is credit

'amount' the amount.
"""


def main(options):
    # Initialize PlugPag
    pp = loadLibraries()
    initPlugPag(pp)

    # Instructions to quit
    # print("\n\n*** Pressione Ctrl+C para finalizar a aplicacao ***")

    # Handle selected option
    transactionResult = TransactionResult()

    if options["action"] == 'pay':
        payment = {}
        if options["paymentMethod"] == 'credit':

            payment["paymentMethod"] = PPPAGSEGURO_CREDIT

            if "installment" not in options:
                payment["installmentType"] = PPPAGSEGURO_A_VISTA
                payment["installment"] = 1

            else:
                parcels = int(options["installment"])

                if parcels > 1:
                    payment["installmentType"] = PPPAGSEGURO_PARC_VENDEDOR
                    payment["installment"] = parcels

                elif parcels == 1:
                    payment["installmentType"] = PPPAGSEGURO_A_VISTA
                    payment["installment"] = 1

        elif options["paymentMethod"] == 'debit':
            payment["paymentMethod"] = PPPAGSEGURO_DEBIT
            payment["installmentType"] = PPPAGSEGURO_A_VISTA
            payment["installment"] = 1

        payment["amount"] = options["amount"]

        f = open("temp2.txt", "w+")
        # Payment option
        try:
            result = transaction.Payment(pp, payment, ENCODING).execute(transactionResult)
            if isinstance(result, ctypes.c_long):
                result = str(result.value)
            returning = {"result": result}
            if result == "0":
                returning["data"] = transactionResult.toDictionary()
            f.write(str(returning))
            return json.dumps(returning)
        except Exception as e:
            f.write(str(e))
            f.flush()
            f.close()

    return None


if __name__ == '__main__':
    main({'action': 'pay', 'paymentMethod': 'credit', 'amount': '1500'})
