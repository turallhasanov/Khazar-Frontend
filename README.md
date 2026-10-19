# Xəzər

Müştəri alış-veriş vitrini (Azərbaycanca). Sifarişlər NexusERP-də idarə olunur.

The catalog and checkout are served by the Khazar C# WebAPI (`Khazar.WebAPI`, default `http://localhost:5293/api/v1`). Start the API before `npm run dev`; set `VITE_API_BASE_URL` to point elsewhere.

## İşə salmaq

```bash
npm install
npm run dev
```

## Skriptlər

- `npm run dev` — inkişaf serveri
- `npm run build` — production yığması
- `npm run preview` — yığmanı önizləmək

## Qeyd

`VITE_API_BASE_URL` üçün `.env.example` faylına baxın.
