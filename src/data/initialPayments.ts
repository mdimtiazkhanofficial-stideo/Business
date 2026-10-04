import { PaymentAccountConfig, PaymentRecord } from '../types';

export const INITIAL_PAYMENT_CONFIGS: PaymentAccountConfig[] = [
  {
    id: 'pay-cfg-bkash',
    method: 'bkash_personal',
    title: 'bKash Personal',
    account_type: 'Personal',
    account_number: '01711-223344',
    account_name: 'SHAD SODAI (Personal)',
    instructions: `১. আপনার bKash অ্যাপে প্রবেশ করুন অথবা *247# ডায়াল করুন।
২. "Send Money" (সেন্ড মানি) অপশন নির্বাচন করুন।
৩. আমাদের bKash Personal নম্বর দিন: 01711-223344
৪. মোট প্রদেয় টাকার পরিমাণ (Payable Amount) লিখুন।
৫. রেফারেন্স হিসেবে আপনার মোবাইল নম্বর বা নাম লিখুন।
৬. পিন দিয়ে সেন্ড মানি কনফার্ম করুন।
৭. সফল লেনদেনের পর প্রাপ্ত TrxID (Transaction ID) নিচের ঘরে লিখুন।`,
    is_enabled: true,
    display_order: 1
  },
  {
    id: 'pay-cfg-nagad',
    method: 'nagad_personal',
    title: 'Nagad Personal',
    account_type: 'Personal',
    account_number: '01811-223344',
    account_name: 'SHAD SODAI (Personal)',
    instructions: `১. আপনার Nagad অ্যাপ ওপেন করুন অথবা *167# ডায়াল করুন।
২. "Send Money" (সেন্ড মানি) অপশন সিলেক্ট করুন।
৩. প্রাপকের নগদ পার্সোনাল নম্বর দিন: 01811-223344
৪. মোট টাকার পরিমাণ লিখুন।
৫. রেফারেন্স দিন এবং পিন দিয়ে নিশ্চিত করুন।
৬. প্রাপ্ত ৮ ডিজিটের TrxID নিচের বক্সে লিখে সাবমিট করুন।`,
    is_enabled: true,
    display_order: 2
  },
  {
    id: 'pay-cfg-rocket',
    method: 'rocket_personal',
    title: 'Rocket Personal',
    account_type: 'Personal',
    account_number: '01911-223344-7',
    account_name: 'SHAD SODAI (Personal)',
    instructions: `১. রকেট অ্যাপ অথবা *322# ডায়াল করে প্রবেশ করুন।
২. "Send Money" নির্বাচন করুন।
৩. আমাদের ১২ ডিজিটের পার্সোনাল রকেট নম্বর দিন: 01911-223344-7
৪. নির্ধারিত টাকার পরিমাণ লিখুন ও পিন দিন।
৫. এসএমএস-এ প্রাপ্ত TxnId নিচের ঘরে প্রদান করুন।`,
    is_enabled: true,
    display_order: 3
  },
  {
    id: 'pay-cfg-bank',
    method: 'bank_transfer',
    title: 'Bank Transfer',
    account_type: 'Personal',
    account_number: '1501203456789001',
    account_name: 'MD IMTIAZ KHAN / SHAD SODAI',
    bank_name: 'BRAC Bank Limited',
    branch_name: 'Uttara Branch, Dhaka',
    routing_number: '060264251',
    instructions: `১. যেকোনো অনলাইন ব্যাংকিং অ্যাপ (NPSB / BEFTN) বা সরাসরি ব্যাংক ডিপোজিটের মাধ্যমে ফান্ড ট্রান্সফার করুন।
২. ব্যাংক নাম: BRAC Bank Limited | শাখা: Uttara Branch, Dhaka
৩. হিসাবের নাম: MD IMTIAZ KHAN / SHAD SODAI
৪. একাউন্ট নম্বর: 1501203456789001 | রাউটিং নম্বর: 060264251
৫. ট্রান্সফার সম্পন্ন হলে ডিপোজিট রেফারেন্স নম্বর নিচে লিখুন এবং প্রমাণস্বরূপ স্লিপ/স্ক্রিনশট আপলোড করুন।`,
    is_enabled: true,
    display_order: 4
  },
  {
    id: 'pay-cfg-cod',
    method: 'cod',
    title: 'Cash on Delivery (COD)',
    account_type: 'COD',
    account_number: 'N/A (Cash on Delivery)',
    instructions: `পণ্য হাতে পেয়ে ডেলিভারি রাইডারের নিকট সরাসরি নগদ টাকা পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।`,
    is_enabled: true,
    display_order: 5
  }
];

export const INITIAL_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay-rec-101',
    order_id: 'ord-101',
    order_number: 'SG-892145',
    customer_id: 'usr-cust-01',
    customer_name: 'Tanvir Hossain',
    customer_phone: '01712-345678',
    payment_method: 'bKash Personal',
    account_type: 'Personal',
    account_number: '01711-223344',
    amount: 1450,
    transaction_id: 'BK9X24L801',
    sender_phone: '01712-345678',
    status: 'PAID',
    admin_note: 'Verified from bKash personal statement at 11:20 AM',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    verified_at: new Date(Date.now() - 3600000 * 22).toISOString()
  },
  {
    id: 'pay-rec-102',
    order_id: 'ord-102',
    order_number: 'SG-892189',
    customer_id: 'usr-cust-02',
    customer_name: 'Mahmudul Hasan',
    customer_phone: '01819-876543',
    payment_method: 'Nagad Personal',
    account_type: 'Personal',
    account_number: '01811-223344',
    amount: 2200,
    transaction_id: 'NG77Y09K32',
    sender_phone: '01819-876543',
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'pay-rec-103',
    order_id: 'ord-103',
    order_number: 'SG-892210',
    customer_id: 'usr-cust-03',
    customer_name: 'Nasir Uddin',
    customer_phone: '01914-112233',
    payment_method: 'Rocket Personal',
    account_type: 'Personal',
    account_number: '01911-223344-7',
    amount: 850,
    transaction_id: 'RK43110992',
    sender_phone: '01914-112233',
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];
