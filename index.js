const express = require('express');
const path = require('path'); // Tambahan: Modul untuk menangani path file
const app = express();
const { Book, BorrowLog } = require('./models');

app.use(express.json());

// ==========================================
// 1. MIDDLEWARE CUSTOM 
// ==========================================
const checkAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Akses Ditolak: Khusus Admin!" });
    }
};

const checkUser = (req, res, next) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    if (role === 'user' && userId) {
        req.userId = userId; 
        next();
    } else {
        res.status(403).json({ message: "Akses Ditolak: Harap kirim Header x-user-role: user & x-user-id!" });
    }
};

// ==========================================
// 2. STATIC FILES & DEFAULT ROUTE
// ==========================================

// Sajikan folder public secara statis
app.use(express.static(path.join(__dirname, 'public')));

// SOLUSI PERMANEN: Mengarahkan root (/) langsung ke login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ==========================================
// 3. PUBLIC ENDPOINTS
// ==========================================

app.get('/api/books', async (req, res) => {
    const books = await Book.findAll();
    res.json(books);
});

app.get('/api/books/:id', async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
    res.json(book);
});

// ==========================================
// 4. ADMIN MODE (Full CRUD)
// ==========================================

app.post('/api/books', checkAdmin, async (req, res) => {
    try {
        const { title, author, stock } = req.body;
        if (!title || !author) return res.status(400).json({ message: "Title dan Author tidak boleh kosong!" });
        
        const newBook = await Book.create({ title, author, stock });
        res.status(201).json({ message: "Buku berhasil ditambah", data: newBook });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/books/:id', checkAdmin, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
        await book.update(req.body);
        res.json({ message: "Buku berhasil diupdate", data: book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/books/:id', checkAdmin, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
        await book.destroy();
        res.json({ message: "Buku berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 5. USER MODE (Borrow & Logs)
// ==========================================

app.post('/api/borrow', checkUser, async (req, res) => {
    try {
        const { bookId, latitude, longitude } = req.body;
        
        const book = await Book.findByPk(bookId);
        if (!book || book.stock <= 0) {
            return res.status(400).json({ message: "Buku habis atau tidak ditemukan" });
        }

        const log = await BorrowLog.create({
            userId: req.userId,
            bookId,
            borrowDate: new Date(), // Menjamin format datetime MySQL benar
            latitude,
            longitude
        });

        await book.update({ stock: book.stock - 1 });
        res.status(201).json({ message: "Peminjaman Berhasil!", data: log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/borrows', async (req, res) => {
    try {
        const logs = await BorrowLog.findAll();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📂 Halaman login otomatis tersedia di http://localhost:${PORT}`);
});