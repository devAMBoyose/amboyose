import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { BookForm } from "../components/BookForm";
import { BookList } from "../components/BookList";
import { ReviewList } from "../components/ReviewList";

export const BooksPage = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [editing, setEditing] = useState(null);
    const [selected, setSelected] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1
    });
    const [loading, setLoading] = useState(false);

    const loadBooks = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/books?page=${page}&limit=8`);
            setBooks(res.data.data);
            setPagination({ page: res.data.page, totalPages: res.data.totalPages });
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async (bookId) => {
        const res = await api.get(`/reviews/book/${bookId}`);
        setReviews(res.data);
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const handleSaveBook = async (payload) => {
        if (!user) return alert("Login required.");
        if (editing) {
            await api.put(`/books/${editing._id}`, payload);
            setEditing(null);
        } else {
            await api.post("/books", payload);
        }
        await loadBooks(pagination.page);
    };

    const handleDeleteBook = async (book) => {
        if (!window.confirm(`Delete "${book.title}"?`)) return;
        await api.delete(`/books/${book._id}`);
        await loadBooks(pagination.page);
        if (selected?._id === book._id) {
            setSelected(null);
            setReviews([]);
        }
    };

    const handleSelectBook = async (book) => {
        setSelected(book);
        await loadReviews(book._id);
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!user || !selected) return;
        const rating = Number(e.target.rating.value);
        const comment = e.target.comment.value;
        await api.post(`/reviews/book/${selected._id}`, { rating, comment });
        e.target.reset();
        await loadReviews(selected._id);
    };

    const nextPage = () => {
        if (pagination.page < pagination.totalPages) {
            loadBooks(pagination.page + 1);
        }
    };
    const prevPage = () => {
        if (pagination.page > 1) {
            loadBooks(pagination.page - 1);
        }
    };

    return (
        <div className="layout-grid">
            <section className="panel">
                <div className="panel-header">
                    <span className="panel-title">Books</span>
                    <span className="chip">
                        Page {pagination.page}/{pagination.totalPages}
                    </span>
                </div>

                {loading ? (
                    <div>Loading books…</div>
                ) : (
                    <BookList
                        books={books}
                        onEdit={(b) => setEditing(b)}
                        onDelete={handleDeleteBook}
                        onOpen={handleSelectBook}
                    />
                )}

                <div
                    style={{
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10
                    }}
                >
                    <button className="btn secondary" onClick={prevPage}>
                        Prev
                    </button>
                    <button className="btn secondary" onClick={nextPage}>
                        Next
                    </button>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <span className="panel-title">
                        {editing ? "Edit Book" : "Add New Book"}
                    </span>
                    <span className="chip">
                        {user ? "Authenticated" : "Guest (read-only)"}
                    </span>
                </div>
                {user ? (
                    <BookForm initial={editing} onSave={handleSaveBook} />
                ) : (
                    <div className="error-text">
                        Login or register to add / edit books.
                    </div>
                )}
            </section>

            {selected && (
                <section className="panel" style={{ gridColumn: "1 / -1" }}>
                    <div className="panel-header">
                        <span className="panel-title">
                            Reviews · {selected.title} by {selected.author}
                        </span>
                        <span className="chip">User feedback</span>
                    </div>
                    <ReviewList reviews={reviews} />

                    {user && (
                        <form onSubmit={handleAddReview} style={{ marginTop: 10 }}>
                            <label>
                                Rating (1–5)
                                <input name="rating" type="number" min="1" max="5" required />
                            </label>
                            <label>
                                Comment
                                <textarea name="comment" rows={2} required />
                            </label>
                            <button className="btn" type="submit">
                                Add Review
                            </button>
                        </form>
                    )}
                </section>
            )}
        </div>
    );
};
