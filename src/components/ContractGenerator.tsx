import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface ContractData {
  gnatonNumber: string;
  simbiozNumber: string;
  customerName: string;
  legalAddress: string;
  postalAddress: string;
  branchAddress: string;
  inn: string;
  kpp: string;
  ogrn: string;
  bank: string;
  bik: string;
  accountNumber: string;
  corrAccount: string;
  positionNominative: string;
  positionGenitive: string;
  signerNameGenitive: string;
  signerNameNominative: string;
  date: string;
  city: string;
}

interface ContractGeneratorProps {
  data: any;
  updateData: (fn: (d: any) => any) => void;
  toast: (msg: string, type?: string) => void;
}

// Реквизиты исполнителей
const GNATON_DETAILS = {
  name: 'ООО "Гнатон"',
  inn: '7712345678',
  kpp: '771201001',
  ogrn: '1177746123456',
  legalAddress: '123456, г. Москва, ул. Примерная, д. 1, оф. 100',
  bank: 'ПАО "Сбербанк"',
  bik: '044525225',
  accountNumber: '40702810123456789012',
  corrAccount: '30101810400000000225',
  director: 'Иванов Иван Иванович'
};

const SIMBIOZ_DETAILS = {
  name: 'ООО "Симбиоз"',
  inn: '7798765432',
  kpp: '779801001',
  ogrn: '1187746765432',
  legalAddress: '654321, г. Санкт-Петербург, пр. Невский, д. 100',
  bank: 'АО "Альфа-Банк"',
  bik: '044525598',
  accountNumber: '40702810987654321098',
  corrAccount: '30101810200000000598',
  director: 'Петров Петр Петрович'
};

// Прайс Гнатон
const GNATON_PRICES = [
  { name: 'Коронка металлокерамическая', price: 15000 },
  { name: 'Коронка безметалловая', price: 20000 },
  { name: 'Винир керамический', price: 25000 },
  { name: 'Мостовидный протез (1 ед.)', price: 18000 },
  { name: 'Съёмный протез (полный)', price: 35000 },
  { name: 'Бюгельный протез', price: 45000 },
  { name: 'Временная коронка', price: 3000 },
  { name: 'Ремонт съёмного протеза', price: 2500 },
];

// Прайс Симбиоз (70+ позиций)
const SIMBIOZ_PRICES = [
  { name: 'Коронка металлокерамическая', price: 15000 },
  { name: 'Коронка безметалловая (циркон)', price: 20000 },
  { name: 'Коронка E-max', price: 22000 },
  { name: 'Винир E-max', price: 25000 },
  { name: 'Винир керамический', price: 23000 },
  { name: 'Вкладка керамическая', price: 18000 },
  { name: 'Мостовидный протез металлокерамический (1 ед.)', price: 18000 },
  { name: 'Мостовидный протез безметалловый (1 ед.)', price: 22000 },
  { name: 'Полный съёмный протез (1 челюсть)', price: 35000 },
  { name: 'Частичный съёмный протез', price: 28000 },
  { name: 'Бюгельный протез', price: 45000 },
  { name: 'Бюгельный протез с замками', price: 55000 },
  { name: 'Временная коронка (акрил)', price: 3000 },
  { name: 'Временная коронка (3D-печать)', price: 2500 },
  { name: 'Временный мост', price: 5000 },
  { name: 'Абатмент индивидуальный (титан)', price: 8000 },
  { name: 'Абатмент индивидуальный (циркон)', price: 12000 },
  { name: 'Хирургический шаблон', price: 7000 },
  { name: 'Балочная конструкция Ao4', price: 85000 },
  { name: 'Балочная конструкция Ao6', price: 120000 },
  { name: 'Элайнер (1 челюсть)', price: 25000 },
  { name: 'Каппа стабилизирующая', price: 8000 },
  { name: 'Сплинт-терапия', price: 25000 },
  { name: 'Ремонт съёмного протеза (трещина)', price: 2500 },
  { name: 'Ремонт протеза (замена зуба)', price: 2000 },
  { name: 'Перебазировка протеза', price: 3000 },
  { name: 'Приварка зуба/кламмера', price: 1500 },
  { name: 'Диагностическая модель', price: 3000 },
  { name: 'Индивидуальная ложка', price: 2000 },
  { name: 'Модель рабочая', price: 2500 },
  { name: 'CAD-моделирование', price: 3000 },
  { name: 'Фрезеровка (1 ед.)', price: 4000 },
  { name: '3D-печать модели', price: 2000 },
  { name: 'Гипсовка', price: 1000 },
  { name: 'Сканирование', price: 1500 },
  { name: 'Шлифовка', price: 1500 },
  { name: 'Керамика (нанесение)', price: 5000 },
  { name: 'Спекание', price: 1500 },
  { name: 'Сборка/финиш', price: 2000 },
  { name: 'Окклюзия/артикуляция', price: 2500 },
  { name: 'Коронка цельнокерамическая', price: 22000 },
  { name: 'Коронка циркониевая', price: 20000 },
  { name: 'Мостовидный протез цельнокерамический', price: 25000 },
  { name: 'Винир цельнокерамический', price: 25000 },
  { name: 'Протез на имплантах', price: 120000 },
  { name: 'Коронка на имплант', price: 25000 },
  { name: 'Абатмент с интерфейсом', price: 15000 },
  { name: 'Балочный протез с кламмерами', price: 60000 },
  { name: 'Балочный протез с телескопическими коронками', price: 80000 },
  { name: 'Несъемный протез на замках', price: 70000 },
  { name: 'Капа ретенционная', price: 5000 },
  { name: 'Алайнеры (1 пара)', price: 25000 },
  { name: 'Сплинт релаксационный', price: 25000 },
  { name: 'Сплинт каплевидный', price: 28000 },
  { name: 'Сплинт диагностический', price: 15000 },
  { name: 'Окклюзионная накладка', price: 8000 },
  { name: 'Депрограмматор', price: 6000 },
  { name: 'Готическая дуга', price: 4000 },
  { name: 'Лицевая дуга', price: 3000 },
  { name: 'Регистратор прикуса', price: 2500 },
  { name: 'Ремонт коронки (скол керамики)', price: 3500 },
  { name: 'Ремонт винира (трещина)', price: 4000 },
  { name: 'Переделка конструкции', price: 8000 },
  { name: 'Консультация ортопеда', price: 2000 },
  { name: 'Консультация гнатолога', price: 3000 },
  { name: 'План лечения', price: 5000 },
  { name: 'Комплексная диагностика', price: 8000 },
  { name: 'Срочное изготовление (+30%)', price: 0 },
  { name: 'Выезд специалиста', price: 5000 },
  { name: 'Доставка по Москве', price: 1000 },
  { name: 'Доставка по России', price: 3000 },
];

export default function ContractGenerator({ data, updateData, toast }: ContractGeneratorProps) {
  const [formData, setFormData] = useState<ContractData>({
    gnatonNumber: '',
    simbiozNumber: '',
    customerName: '',
    legalAddress: '',
    postalAddress: '',
    branchAddress: '',
    inn: '',
    kpp: '',
    ogrn: '',
    bank: '',
    bik: '',
    accountNumber: '',
    corrAccount: '',
    positionNominative: '',
    positionGenitive: '',
    signerNameGenitive: '',
    signerNameNominative: '',
    date: new Date().toLocaleDateString('ru-RU'),
    city: 'Москва'
  });

  // Валидация формы
  const validateForm = (): boolean => {
    const required = [
      'gnatonNumber', 'simbiozNumber', 'customerName', 'legalAddress',
      'inn', 'kpp', 'ogrn', 'bank', 'bik', 'accountNumber', 'corrAccount',
      'positionNominative', 'positionGenitive', 'signerNameGenitive', 
      'signerNameNominative', 'date', 'city'
    ];

    for (const field of required) {
      if (!formData[field as keyof ContractData]) {
        toast(`Заполните поле: ${field}`, 'error');
        return false;
      }
    }

    // Проверка даты
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(formData.date)) {
      toast('Дата должна быть в формате ДД.ММ.ГГГГ', 'error');
      return false;
    }

    return true;
  };

  // Создание таблицы реквизитов
  const createDetailsTable = (executor: typeof GNATON_DETAILS, customer: ContractData) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'ИСПОЛНИТЕЛЬ', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: executor.name })] }),
                new Paragraph({ children: [new TextRun({ text: `ИНН: ${executor.inn}` })] }),
                new Paragraph({ children: [new TextRun({ text: `КПП: ${executor.kpp}` })] }),
                new Paragraph({ children: [new TextRun({ text: `ОГРН: ${executor.ogrn}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Адрес: ${executor.legalAddress}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Банк: ${executor.bank}` })] }),
                new Paragraph({ children: [new TextRun({ text: `БИК: ${executor.bik}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Р/с: ${executor.accountNumber}` })] }),
                new Paragraph({ children: [new TextRun({ text: `К/с: ${executor.corrAccount}` })] }),
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'ЗАКАЗЧИК', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: customer.customerName })] }),
                new Paragraph({ children: [new TextRun({ text: `ИНН: ${customer.inn}` })] }),
                new Paragraph({ children: [new TextRun({ text: `КПП: ${customer.kpp}` })] }),
                new Paragraph({ children: [new TextRun({ text: `ОГРН: ${customer.ogrn}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Адрес: ${customer.legalAddress}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Банк: ${customer.bank}` })] }),
                new Paragraph({ children: [new TextRun({ text: `БИК: ${customer.bik}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Р/с: ${customer.accountNumber}` })] }),
                new Paragraph({ children: [new TextRun({ text: `К/с: ${customer.corrAccount}` })] }),
              ]
            })
          ]
        })
      ]
    });
  };

  // Создание таблицы подписей
  const createSignaturesTable = (executor: typeof GNATON_DETAILS, customer: ContractData) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'ИСПОЛНИТЕЛЬ:', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: executor.name })] }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Paragraph({ children: [new TextRun({ text: `_________________ / ${executor.director} /` })] }),
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'ЗАКАЗЧИК:', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: customer.customerName })] }),
                new Paragraph({ children: [new TextRun({ text: customer.positionNominative })] }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Paragraph({ children: [new TextRun({ text: `_________________ / ${customer.signerNameNominative} /` })] }),
              ]
            })
          ]
        })
      ]
    });
  };

  // Генерация договора Гнатон
  const generateGnatonContract = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'ДОГОВОР ОКАЗАНИЯ УСЛУГ № ' + formData.gnatonNumber, bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `г. ${formData.city}                                                     ${formData.date}`, size: 24 })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({
            children: [new TextRun({ 
              text: `${GNATON_DETAILS.name}, именуемое в дальнейшем "Исполнитель", в лице ${GNATON_DETAILS.director}, действующего на основании Устава, с одной стороны, и`,
              size: 24
            })]
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `${formData.customerName}, именуемое в дальнейшем "Заказчик", в лице ${formData.signerNameGenitive}, ${formData.positionGenitive}, действующего на основании Устава, с другой стороны, заключили настоящий Договор о нижеследующем:`,
              size: 24
            })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 1
          new Paragraph({ children: [new TextRun({ text: '1. ПРЕДМЕТ ДОГОВОРА', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.1. Исполнитель обязуется оказать Заказчику услуги по изготовлению зуботехнических изделий, а Заказчик обязуется принять и оплатить эти услуги.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.2. Перечень, количество и стоимость услуг определяются в Приложении №1, являющемся неотъемлемой частью настоящего Договора.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 2
          new Paragraph({ children: [new TextRun({ text: '2. ПРАВА И ОБЯЗАННОСТИ СТОРОН', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.1. Исполнитель обязан:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.1.1. Оказать услуги качественно и в согласованные сроки.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.1.2. Использовать материалы надлежащего качества.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.2. Заказчик обязан:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.2.1. Предоставить необходимую информацию и материалы.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.2.2. Принять и оплатить оказанные услуги.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 3
          new Paragraph({ children: [new TextRun({ text: '3. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЁТОВ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.1. Стоимость услуг определяется согласно Приложению №1.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.2. Оплата производится в рублях РФ путем безналичного перечисления.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.3. Срок оплаты - 5 банковских дней с момента подписания акта оказанных услуг.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 4
          new Paragraph({ children: [new TextRun({ text: '4. СРОКИ ОКАЗАНИЯ УСЛУГ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '4.1. Сроки изготовления изделий определяются в заявках-заказах.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '4.2. Стандартный срок изготовления - 7-14 рабочих дней.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 5
          new Paragraph({ children: [new TextRun({ text: '5. ПОРЯДОК СДАЧИ-ПРИЁМКИ УСЛУГ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '5.1. По факту оказания услуг Исполнитель предоставляет Заказчику акт оказанных услуг.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '5.2. Заказчик обязан подписать акт в течение 5 рабочих дней.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 6
          new Paragraph({ children: [new TextRun({ text: '6. ОТВЕТСТВЕННОСТЬ СТОРОН', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '6.1. За неисполнение обязательств стороны несут ответственность в соответствии с законодательством РФ.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '6.2. Неустойка за просрочку оплаты - 0,1% от суммы задолженности за каждый день просрочки.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 7
          new Paragraph({ children: [new TextRun({ text: '7. ГАРАНТИИ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '7.1. Исполнитель гарантирует качество изготовленных изделий.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '7.2. Гарантийный срок - 12 месяцев с момента передачи изделия.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 8
          new Paragraph({ children: [new TextRun({ text: '8. КОНФИДЕНЦИАЛЬНОСТЬ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '8.1. Стороны обязуются сохранять конфиденциальность полученной информации.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 9
          new Paragraph({ children: [new TextRun({ text: '9. РАЗРЕШЕНИЕ СПОРОВ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '9.1. Все споры разрешаются путем переговоров.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '9.2. При недостижении согласия - в суде по месту нахождения Исполнителя.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 10
          new Paragraph({ children: [new TextRun({ text: '10. СРОК ДЕЙСТВИЯ ДОГОВОРА', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '10.1. Договор вступает в силу с момента подписания и действует до 31.12.2026.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '10.2. Договор автоматически пролонгируется на каждый календарный год.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Раздел 11
          new Paragraph({ children: [new TextRun({ text: '11. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '11.1. Все изменения и дополнения действительны в письменной форме.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '11.2. Договор составлен в двух экземплярах, имеющих одинаковую силу.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Реквизиты
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          createDetailsTable(GNATON_DETAILS, formData),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Подписи
          createSignaturesTable(GNATON_DETAILS, formData),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Приложение 1
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Приложение №1 к Договору № ' + formData.gnatonNumber, bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'ПРАЙС-ЛИСТ', bold: true, size: 24 })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Таблица прайса
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '№', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Наименование услуги', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Цена (руб.)', bold: true })] })] }),
                ]
              }),
              ...GNATON_PRICES.map((item, index) => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(index + 1) })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.name })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.price.toLocaleString() })] })] }),
                  ]
                })
              )
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Подписи в приложении
          createSignaturesTable(GNATON_DETAILS, formData),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Договор_Гнатон_${formData.gnatonNumber}_${formData.customerName.replace(/\s+/g, '_')}.docx`;
    saveAs(blob, fileName);
  };

  // Генерация договора Симбиоз
  const generateSimbiozContract = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'ДОГОВОР ОКАЗАНИЯ УСЛУГ № ' + formData.simbiozNumber, bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `г. ${formData.city}                                                     ${formData.date}`, size: 24 })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({
            children: [new TextRun({ 
              text: `${SIMBIOZ_DETAILS.name}, именуемое в дальнейшем "Исполнитель", в лице ${SIMBIOZ_DETAILS.director}, действующего на основании Устава, с одной стороны, и`,
              size: 24
            })]
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `${formData.customerName}, именуемое в дальнейшем "Заказчик", в лице ${formData.signerNameGenitive}, ${formData.positionGenitive}, действующего на основании Устава, с другой стороны, заключили настоящий Договор о нижеследующем:`,
              size: 24
            })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Разделы 1-11 (аналогично Гнатон)
          new Paragraph({ children: [new TextRun({ text: '1. ПРЕДМЕТ ДОГОВОРА', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.1. Исполнитель обязуется оказать Заказчику услуги по изготовлению зуботехнических изделий, а Заказчик обязуется принять и оплатить эти услуги.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.2. Перечень услуг определяется в п.12 настоящего Договора.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '2. ПРАВА И ОБЯЗАННОСТИ СТОРОН', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.1. Исполнитель обязан оказать услуги качественно и в срок.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.2. Заказчик обязан предоставить информацию и оплатить услуги.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '3. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЁТОВ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.1. Стоимость услуг определяется согласно п.12.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.2. Оплата - безналичный расчёт в рублях РФ.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '4. СРОКИ ОКАЗАНИЯ УСЛУГ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '4.1. Сроки определяются в заказ-нарядах.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '5. ПОРЯДОК СДАЧИ-ПРИЁМКИ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '5.1. Акт оказанных услуг предоставляется Заказчику.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '6. ОТВЕТСТВЕННОСТЬ СТОРОН', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '6.1. Стороны несут ответственность по законодательству РФ.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '7. ГАРАНТИИ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '7.1. Гарантия на изделия - 12 месяцев.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '8. КОНФИДЕНЦИАЛЬНОСТЬ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '8.1. Стороны сохраняют конфиденциальность информации.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '9. РАЗРЕШЕНИЕ СПОРОВ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '9.1. Споры разрешаются путем переговоров, затем в суде.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '10. СРОК ДЕЙСТВИЯ ДОГОВОРА', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '10.1. Договор действует до 31.12.2026 с автоматической пролонгацией.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          new Paragraph({ children: [new TextRun({ text: '11. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '11.1. Изменения - в письменной форме.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '11.2. Договор в двух экземплярах.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Пункт 12 - Прейскурант
          new Paragraph({ children: [new TextRun({ text: '12. ПРЕЙСКУРАНТ', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Перечень услуг и их стоимость:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Таблица прайса Симбиоз
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '№', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Наименование услуги', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Цена (руб.)', bold: true })] })] }),
                ]
              }),
              ...SIMBIOZ_PRICES.map((item, index) => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(index + 1) })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.name })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.price.toLocaleString() })] })] }),
                  ]
                })
              )
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Реквизиты
          createDetailsTable(SIMBIOZ_DETAILS, formData),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Подписи
          createSignaturesTable(SIMBIOZ_DETAILS, formData),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Приложение 1 - Заказ-наряд
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Приложение №1 к Договору № ' + formData.simbiozNumber, bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'ЗАКАЗ-НАРЯД', bold: true, size: 24 })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Заказчик: _________________________________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Дата: _______________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Номер заказа: __________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Перечень услуг:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1. _____________________________________________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2. _____________________________________________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3. _____________________________________________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Срок выполнения: _______________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Стоимость: _______________ руб.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Подпись Заказчика: _________________', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Приложение 2 - Регламент
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Приложение №2 к Договору № ' + formData.simbiozNumber, bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'РЕГЛАМЕНТ СОТРУДНИЧЕСТВА', bold: true, size: 24 })]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: '1. Порядок взаимодействия:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.1. Заказчик направляет заказ через систему MyOrtLab.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.2. Исполнитель подтверждает получение и сроки.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.3. После изготовления Исполнитель уведомляет Заказчика.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '1.4. Доставка осуществляется курьерской службой.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: '2. Требования к заказам:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.1. Заказы принимаются через систему MyOrtLab.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.2. Обязательное прикрепление файлов (сканы, фото, КТ).', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '2.3. Указание сроков и особых требований.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: '3. Гарантии и reklamation:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.1. Гарантия на изделия - 12 месяцев.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.2. При обнаружении дефектов Заказчик направляет reklamation.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '3.3. Исполнитель устраняет дефекты в согласованные сроки.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({ children: [new TextRun({ text: '4. Финансовые условия:', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '4.1. Предоплата 50% при размещении заказа.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '4.2. Окончательный расчёт после сдачи изделия.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '4.3. Срок оплаты - 5 банковских дней.', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          
          // Подписи
          createSignaturesTable(SIMBIOZ_DETAILS, formData),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Договор_Симбиоз_${formData.simbiozNumber}_${formData.customerName.replace(/\s+/g, '_')}.docx`;
    saveAs(blob, fileName);
  };

  // Генерация обоих договоров
  const generateBothContracts = async () => {
    if (!validateForm()) return;

    try {
      await generateGnatonContract();
      await generateSimbiozContract();
      toast('Оба договора успешно сгенерированы');
    } catch (error) {
      toast('Ошибка генерации договоров', 'error');
      console.error(error);
    }
  };

  // Очистка формы
  const clearForm = () => {
    setFormData({
      gnatonNumber: '',
      simbiozNumber: '',
      customerName: '',
      legalAddress: '',
      postalAddress: '',
      branchAddress: '',
      inn: '',
      kpp: '',
      ogrn: '',
      bank: '',
      bik: '',
      accountNumber: '',
      corrAccount: '',
      positionNominative: '',
      positionGenitive: '',
      signerNameGenitive: '',
      signerNameNominative: '',
      date: new Date().toLocaleDateString('ru-RU'),
      city: 'Москва'
    });
    toast('Форма очищена');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">📄 Генератор договоров</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Левая колонка */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Номер договора (Гнатон) *</label>
            <input
              type="text"
              value={formData.gnatonNumber}
              onChange={e => setFormData({ ...formData, gnatonNumber: e.target.value })}
              className="input-field"
              placeholder="10-062026"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Номер договора (Симбиоз) *</label>
            <input
              type="text"
              value={formData.simbiozNumber}
              onChange={e => setFormData({ ...formData, simbiozNumber: e.target.value })}
              className="input-field"
              placeholder="15-062026"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Полное наименование Заказчика *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              className="input-field"
              placeholder="ООО «Новая Клиника»"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Юридический адрес *</label>
            <input
              type="text"
              value={formData.legalAddress}
              onChange={e => setFormData({ ...formData, legalAddress: e.target.value })}
              className="input-field"
              placeholder="123456, г. Москва, ул. Примерная, д. 1"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Почтовый адрес</label>
            <input
              type="text"
              value={formData.postalAddress}
              onChange={e => setFormData({ ...formData, postalAddress: e.target.value })}
              className="input-field"
              placeholder="123456, г. Москва, ул. Примерная, д. 1"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Адрес обособленного подразделения</label>
            <input
              type="text"
              value={formData.branchAddress}
              onChange={e => setFormData({ ...formData, branchAddress: e.target.value })}
              className="input-field"
              placeholder="123456, г. Москва, ул. Филиал, д. 2"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm font-medium block mb-1">ИНН *</label>
              <input
                type="text"
                value={formData.inn}
                onChange={e => setFormData({ ...formData, inn: e.target.value })}
                className="input-field"
                placeholder="7712345678"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">КПП *</label>
              <input
                type="text"
                value={formData.kpp}
                onChange={e => setFormData({ ...formData, kpp: e.target.value })}
                className="input-field"
                placeholder="771201001"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">ОГРН *</label>
              <input
                type="text"
                value={formData.ogrn}
                onChange={e => setFormData({ ...formData, ogrn: e.target.value })}
                className="input-field"
                placeholder="1177746123456"
              />
            </div>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Банк *</label>
            <input
              type="text"
              value={formData.bank}
              onChange={e => setFormData({ ...formData, bank: e.target.value })}
              className="input-field"
              placeholder="ПАО «Сбербанк»"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium block mb-1">БИК *</label>
              <input
                type="text"
                value={formData.bik}
                onChange={e => setFormData({ ...formData, bik: e.target.value })}
                className="input-field"
                placeholder="044525225"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Р/С *</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                className="input-field"
                placeholder="40702810123456789012"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">К/С *</label>
            <input
              type="text"
              value={formData.corrAccount}
              onChange={e => setFormData({ ...formData, corrAccount: e.target.value })}
              className="input-field"
              placeholder="30101810400000000225"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium block mb-1">Должность (им. пад.) *</label>
              <input
                type="text"
                value={formData.positionNominative}
                onChange={e => setFormData({ ...formData, positionNominative: e.target.value })}
                className="input-field"
                placeholder="Генеральный директор"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Должность (род. пад.) *</label>
              <input
                type="text"
                value={formData.positionGenitive}
                onChange={e => setFormData({ ...formData, positionGenitive: e.target.value })}
                className="input-field"
                placeholder="генерального директора"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium block mb-1">ФИО (род. пад.) *</label>
              <input
                type="text"
                value={formData.signerNameGenitive}
                onChange={e => setFormData({ ...formData, signerNameGenitive: e.target.value })}
                className="input-field"
                placeholder="Иванова Ивана Ивановича"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">ФИО (им. пад.) *</label>
              <input
                type="text"
                value={formData.signerNameNominative}
                onChange={e => setFormData({ ...formData, signerNameNominative: e.target.value })}
                className="input-field"
                placeholder="Иванов И.И."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium block mb-1">Дата (ДД.ММ.ГГГГ) *</label>
              <input
                type="text"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                placeholder="10.06.2026"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Город *</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                placeholder="Москва"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 mt-6 pt-6 border-t">
        <button onClick={generateBothContracts} className="btn-primary flex-1">
          📄 Сгенерировать 2 DOCX
        </button>
        <button onClick={clearForm} className="btn-outline">
          🗑️ Очистить
        </button>
      </div>
    </div>
  );
}
