# Panduan Berkontribusi di LeanScrape

Kami menyambut gembira kontribusi dari pengembang di seluruh dunia! Harap ikuti aturan dasar di bawah ini untuk berkolaborasi dalam proyek ini.

## Aturan Git & Branching
1. Buat branch baru dari `main` dengan format:
   - `feat/nama-fitur` untuk fitur baru.
   - `fix/nama-bug` untuk perbaikan bug.
   - `docs/nama-dokumen` untuk perubahan dokumentasi.

## Standar Commit Message (Conventional Commits)
Gunakan format conventional commits standar:
* `feat: menambahkan endpoint interact`
* `fix: memperbaiki error symlink pada android/termux`
* `docs: memperbarui panduan instalasi di readme`

## Aturan Code Quality
1. Pastikan kode lulus proses linting dengan menjalankan:
   ```bash
   npm run lint
   ```
2. Pastikan program dapat dikompilasi (build) dengan sukses:
   ```bash
   npm run build
   ```

Terima kasih atas dedikasi Anda membangun stack data web yang lebih bersih bersama LeanianStudio!
