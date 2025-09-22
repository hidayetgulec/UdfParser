'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [htmlData, setHtmlData] = useState(''); // HTML verisini burada tutacağız

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('udfFile', file);

    try {
      const res = await fetch('API CALL', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to process the UDF file');
      }

      const data = await res.json();
      setHtmlData(data.jsonData); // Gelen veriyi HTML'e çevireceğiz
    } catch (error) {
      console.error(error);
      alert('Error occurred while processing the file');
    }
  };

  // Veriyi HTML formatına dönüştüren fonksiyon
  const createHtmlFromText = (text) => {
    // Metin dizi ise işleme alalım
    const textStr = Array.isArray(text) ? text.join(' ') : text; // Gelen metni birleştiriyoruz

    // Satır sonlarını ve tabları HTML etiketlerine dönüştür
    return textStr
      .replace(/\n/g, '<br />') // Satır sonlarını <br /> ile değiştir
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') // Tab karakterlerini dört boşlukla değiştir
      .replace(/:/g, ':<br />'); // ":" işaretinden sonra satır başı ekleyebilirsiniz
  };

  return (
    <div>
      <h1>UDF Dosyasını Yükleyin</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Yükle</button>
      </form>

      {/* HTML render işlemi */}
      {htmlData && (
        <div className='flex flex-col items-center justify-center m-6'>
          <h2>Veri:</h2>
          <div dangerouslySetInnerHTML={{ __html: createHtmlFromText(htmlData) }} />
        </div>
      )}
    </div>
  );
}
