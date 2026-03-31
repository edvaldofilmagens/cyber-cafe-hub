interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  total: number;
  mesa?: number | null;
  date?: Date;
}

export const printReceipt = ({ items, total, mesa, date }: ReceiptData) => {
  const now = date ?? new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const lines = [
    "========================================",
    "          CONECTA REMÍGIO",
    "        Cyber Café & Internet",
    "========================================",
    `Data: ${dateStr}  Hora: ${timeStr}`,
    mesa ? `Mesa: ${mesa}` : "",
    "----------------------------------------",
    "ITEM                  QTD   VALOR",
    "----------------------------------------",
    ...items.map((item) => {
      const name = item.name.padEnd(20).slice(0, 20);
      const qty = String(item.qty).padStart(3);
      const val = `R$ ${(item.price * item.qty).toFixed(2)}`.padStart(10);
      return `${name}  ${qty}  ${val}`;
    }),
    "----------------------------------------",
    `TOTAL:               R$ ${total.toFixed(2)}`.padStart(40),
    "----------------------------------------",
    "     Obrigado pela preferência!",
    "========================================",
    "",
  ];

  const content = lines.filter(Boolean).join("\n");

  const printWindow = window.open("", "_blank", "width=300,height=600");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Cupom - Conecta Remígio</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
          }
          pre { white-space: pre-wrap; margin: 0; }
          @media print {
            body { width: 100%; padding: 0; }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
