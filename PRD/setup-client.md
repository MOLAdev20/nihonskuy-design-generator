# PRD / Document Plan: Client UI Generator Poster Loker

## 1. Ringkasan

Bangun client web berbasis React JS, Vite, dan Tailwind CSS untuk membuat poster lowongan kerja Nihonskuy. UI harus intuitif, modern, minimalis, dan memakai visual direction dark mode cyberpunk.

Client hanya berfokus pada input data poster, pengelolaan poin syarat dan benefit, submit ke backend, serta mengunduh hasil poster yang dikembalikan backend sebagai gambar.

## 2. Scope

### In Scope

- Membuat tampilan single page untuk form generator poster.
- Menyediakan topbar dengan branding Nihonskuy dan logo teks `NS`.
- Menyediakan area konten dengan margin kiri dan kanan yang konsisten.
- Menyediakan input teks untuk:
  - Lokasi
  - Range Gaji
  - Posisi Pekerjaan
- Menyediakan dynamic input untuk:
  - Syarat
  - Benefit
- Menyediakan tombol submit untuk mengirim data ke backend.
- Mengunduh response backend sebagai file gambar.
- Menampilkan loading state dan error state dasar.

### Out of Scope

- Autentikasi user.
- Integrasi database.
- Riwayat poster.
- Preview poster sebelum submit.
- Upload PDF.
- Editor desain poster.
- Perubahan endpoint backend.

## 3. Tujuan Produk

User dapat mengisi data lowongan kerja melalui form yang jelas dan cepat, lalu mendapatkan file poster hasil generate dari backend tanpa perlu memahami format JSON atau API.

## 4. Persona Pengguna

Pengguna utama adalah admin atau staf operasional Nihonskuy yang perlu membuat poster loker secara berulang. Mereka membutuhkan workflow yang cepat, minim distraksi, dan mudah dipahami.

## 5. Struktur UI

### 5.1 Topbar

Topbar berada di bagian atas halaman.

Elemen wajib:
- Logo sederhana berbentuk teks `NS`.
- Nama brand `Nihonskuy` di sebelah logo.

Arahan visual:
- Dark surface.
- Aksen cyberpunk menggunakan warna neon seperti cyan, electric blue, atau hot pink secara terbatas.
- Tetap minimalis, tidak penuh dekorasi.

### 5.2 Konten Utama

Konten berada di bawah topbar dengan margin kiri dan kanan.

Layout direkomendasikan:
- Desktop: form berada dalam container utama yang rapi dan mudah discan.
- Mobile: form full-width dengan spacing yang nyaman.
- Gunakan section yang jelas untuk data utama, syarat, benefit, dan aksi submit.

Jangan membuat landing page atau hero marketing. Halaman pertama harus langsung berupa tool generator poster.

## 6. Form Input

### 6.1 Input Utama

Field wajib:
- Lokasi
- Range Gaji
- Posisi Pekerjaan

Contoh nilai:
- Lokasi: `SAITAMA - MISATO`
- Range Gaji: `¥272,200 - ¥302,200`
- Posisi Pekerjaan: `RESTORAN (HOTEL)`

Perilaku:
- Field wajib tidak boleh kosong saat submit.
- Jika field wajib kosong, tampilkan pesan error yang ringkas di area form.
- Gunakan placeholder yang membantu, tetapi jangan terlalu panjang.

### 6.2 Dynamic Input: Syarat

User dapat menambah dan mengurangi item syarat.

Perilaku:
- Minimal tampilkan satu input syarat secara default.
- Tombol tambah menambahkan input baru di bawah input terakhir.
- Tombol hapus menghapus input terkait.
- Item kosong tidak perlu dikirim ke backend.

Contoh:
- `Domisili Jepang`
- `JLPT N4`
- `Kaiwa N3`

### 6.3 Dynamic Input: Benefit

User dapat menambah dan mengurangi item benefit.

Perilaku:
- Minimal tampilkan satu input benefit secara default.
- Tombol tambah menambahkan input baru di bawah input terakhir.
- Tombol hapus menghapus input terkait.
- Item kosong tidak perlu dikirim ke backend.

Contoh:
- `Kenaikan Gaji`
- `Lembur`
- `Asrama`
- `Makan Bergizi Gratis`
- `Tempat Ibadah`

## 7. API Contract

### Endpoint

`POST http://localhost:8080/api/generate-poster`

### Request Body

Client mengirim JSON dengan struktur:

```json
{
  "lokasi": "SAITAMA - MISATO",
  "gaji": "¥272,200 - ¥302,200",
  "posisi": "RESTORAN (HOTEL)",
  "syarat": [
    "Domisili Jepang",
    "JLPT N4",
    "Kaiwa N3"
  ],
  "benefit": [
    "Kenaikan Gaji",
    "Lembur",
    "Asrama",
    "Makan Bergizi Gratis",
    "Tempat Ibadah"
  ]
}
```

### Response

Backend mengembalikan gambar dengan header:

`Content-Type: image/png`

Walaupun backend mengirim PNG, requirement client adalah mengunduh file sebagai JPG. Implementasi boleh mengunduh blob response dengan ekstensi `.jpg`, tanpa melakukan konversi format di client.

Nama file rekomendasi:

`poster-loker-nihonskuy.jpg`

## 8. Submit Flow

Flow utama:

1. User mengisi field utama.
2. User menambah atau menghapus item syarat dan benefit sesuai kebutuhan.
3. User menekan tombol submit.
4. Client melakukan validasi field wajib.
5. Client mengirim request JSON ke backend.
6. Client menerima response sebagai blob gambar.
7. Client membuat object URL dari blob.
8. Client mentrigger download file `poster-loker-nihonskuy.jpg`.
9. Client membersihkan object URL setelah download dipicu.

## 9. State UI

State yang harus ditangani:

- Idle: form siap digunakan.
- Loading: request sedang diproses, tombol submit disabled.
- Success: download berhasil dipicu.
- Error: request gagal atau validasi gagal.

Ketentuan:
- Saat loading, user tidak boleh memicu submit berulang.
- Pesan error harus jelas dan tidak teknis berlebihan.
- Form tidak perlu direset otomatis setelah success.

## 10. Arahan Desain

Visual direction: dark mode cyberpunk, modern, minimalis.

Arahan praktis:
- Background gelap dengan kontras cukup.
- Gunakan aksen neon secara terkendali untuk focus ring, button, border aktif, atau highlight.
- Hindari tampilan terlalu ramai.
- Gunakan spacing konsisten.
- Input harus jelas terbaca.
- Tombol utama harus terlihat sebagai aksi paling penting.
- Dynamic input harus mudah dipahami tanpa instruksi panjang.

Komponen UI utama:
- Topbar.
- Form card atau form panel.
- Text input.
- Dynamic list input.
- Button tambah item.
- Button hapus item.
- Submit button.
- Loading indicator sederhana.
- Error message.

## 11. Responsiveness

Target minimal:
- Desktop.
- Tablet.
- Mobile.

Ketentuan:
- Konten tidak boleh menempel ke tepi layar.
- Input harus full-width pada mobile.
- Button dynamic input tetap mudah ditekan pada mobile.
- Tidak boleh ada teks yang overflow keluar container.

## 12. Validasi

Validasi minimum sebelum submit:

- `lokasi` wajib diisi.
- `gaji` wajib diisi.
- `posisi` wajib diisi.
- `syarat` dikirim sebagai array string.
- `benefit` dikirim sebagai array string.
- Item kosong pada `syarat` dan `benefit` dibuang sebelum request.

Tidak perlu validasi format gaji yang kompleks pada fase ini.

## 13. Error Handling

Kondisi error yang harus ditangani:

- Backend tidak dapat diakses.
- Backend mengembalikan status non-2xx.
- Response bukan blob gambar yang valid.
- Validasi field wajib gagal.

Pesan error cukup ringkas, misalnya:

- `Lengkapi lokasi, range gaji, dan posisi pekerjaan.`
- `Gagal membuat poster. Coba lagi beberapa saat.`

## 14. Acceptance Criteria

Implementasi dianggap selesai jika:

- Topbar menampilkan logo `NS` dan teks `Nihonskuy`.
- Form menampilkan input Lokasi, Range Gaji, dan Posisi Pekerjaan.
- User bisa menambah dan menghapus item Syarat.
- User bisa menambah dan menghapus item Benefit.
- Submit mengirim request ke `POST http://localhost:8080/api/generate-poster`.
- Payload request sesuai kontrak API.
- Response gambar dari backend otomatis diunduh sebagai file `.jpg`.
- Loading state aktif selama request berjalan.
- Error state tampil saat validasi atau request gagal.
- UI responsive dan tetap usable pada mobile.
- Tampilan mengikuti arah dark mode cyberpunk yang minimalis.

## 15. Rekomendasi Struktur Implementasi

Gunakan struktur sederhana agar mudah dirawat:

```text
src/
  components/
    Topbar.jsx
    TextInput.jsx
    DynamicInputList.jsx
    SubmitButton.jsx
  services/
    posterApi.js
  App.jsx
  main.jsx
  index.css
```

Pembagian tanggung jawab:

- `Topbar`: hanya branding.
- `TextInput`: komponen input reusable.
- `DynamicInputList`: mengelola list input syarat dan benefit.
- `SubmitButton`: menampilkan state idle/loading.
- `posterApi`: menangani request backend dan download blob.
- `App`: mengelola state form dan submit flow.

## 16. Catatan Teknis

- Gunakan `fetch` atau HTTP client yang sudah tersedia di project.
- Pastikan request header menggunakan `Content-Type: application/json`.
- Gunakan `response.blob()` untuk membaca response gambar.
- Gunakan `URL.createObjectURL(blob)` untuk proses download.
- Gunakan `URL.revokeObjectURL(url)` setelah download dipicu.
- Endpoint backend diasumsikan berjalan di `localhost:8080`.
