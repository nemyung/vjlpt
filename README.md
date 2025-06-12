# VJLPT

A modern, interactive flashcard application designed to accelerate Japanese vocabulary mastery for JLPT success. Built with cutting-edge web technologies to deliver a seamless learning experience across all devices.

> [!WARNING]  
> **Mobile-First Design**: This application is currently optimized exclusively for mobile devices. The UI and user experience are tailored for smartphone usage. Desktop compatibility may be limited.

## 🛠 Tech Stack

### App

- **Frontend Framework**: React 19 + TypeScript
- **Routing**: TanStack Router (File-based routing)
- **Styling**: SCSS Modules
- **Design System**: Vercel Geist Colors
- **Build Tool**: Vite 6
- **Database**: PGlite (Embedded PostgreSQL)
- **ORM**: Drizzle ORM
- **Deployment**: Vercel
- **Code Quality**: Biome (Linting & Formatting)
- **Icons**: Lucide React

### Data Processing

- **Language**: TypeScript
- **Processing Scripts**: Custom TypeScript parsers
- **Database Migration**: Drizzle Kit
- **Package Manager**: pnpm

## 🚀 Getting Started

```bash
pnpm install

pnpm dev

pnpm build

# Migrations
pnpm hey
```

## 📊 Data Sources

This project utilizes JLPT vocabulary data with the following attribution chain:

- **[yomitan-jlpt-vocab](https://github.com/stephenmk/yomitan-jlpt-vocab)** by stephenmk  
  A comprehensive collection of JLPT vocabulary data that served as a reference for structuring our vocabulary datasets.

- **Jonathan Waller's JLPT Resources** (Original Source)  
  The foundational JLPT vocabulary data sourced under Creative Commons BY license.  
  This is the same resource used by jisho.org for their vocabulary data.

**Note**: The original vocabulary data has been processed and adapted for this application's specific requirements. We appreciate the open-source community's contribution to Japanese language learning resources.

---

## 📄 License

### Application Code

MIT License

Copyright (c) 2025 VJLPT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Data Sources

The JLPT vocabulary data referenced from [yomitan-jlpt-vocab](https://github.com/stephenmk/yomitan-jlpt-vocab) by stephenmk is licensed under:

**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**

This means:

- ✅ You can use, share, and adapt the data
- 📝 You must provide attribution to the original author
- 🔄 Any derivatives must be shared under the same license
- 🔗 Full license text: https://creativecommons.org/licenses/by-sa/4.0/
