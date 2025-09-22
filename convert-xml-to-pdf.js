import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { NextResponse } from 'next/server';
import xml2js from 'xml2js';
import { jsPDF } from 'jspdf';

export async function POST(req) {
  try {
    // FormData'dan gelen ZIP dosyasını al
    const formData = await req.formData();
    const udfFile = formData.get('udfFile');

    if (!udfFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ZIP dosyasını geçici bir dosyaya yaz
    const filePath = path.join(process.cwd(), 'uploads', udfFile.name);
    const buffer = await udfFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // ZIP dosyasını aç
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    // XML dosyasını çıkar
    let xmlContent = '';
    zipEntries.forEach(entry => {
      if (entry.entryName.endsWith('.xml')) {
        xmlContent = entry.getData().toString('utf8');
      }
      console.log(xmlContent)
    });

    if (!xmlContent) {
      return NextResponse.json({ error: 'No XML file found in ZIP' }, { status: 400 });
    }

    // XML'i JSON'a çevir
    const parser = new xml2js.Parser();
    const jsonData = await new Promise((resolve, reject) => {
      parser.parseString(xmlContent, (err, result) => {
        if (err) reject('Error parsing XML content');
        resolve(result);
      });
    });

    // JSON verisini al (örneğin template.content)
    const data = JSON.stringify(jsonData, null, 2);

    // PDF oluştur
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('XML to PDF Output', 10, 10);

    let y = 20;
    const lines = data.split('\n');

    lines.forEach(line => {
      doc.text(line, 10, y);
      y += 7; // Satır aralığı
    });

    // PDF'i Base64 olarak döndür
    const pdfBase64 = doc.output('datauristring');

    return NextResponse.json({ pdfDataUri: pdfBase64 });
  } catch (error) {
    console.error('Error processing UDF:', error);
    return NextResponse.json({ error: 'Failed to process UDF' }, { status: 500 });
  }
}
