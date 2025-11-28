export const BookList = ({ books, onEdit, onDelete, onOpen }) => {
    return (
        <div className="book-list">
            {books.map((b) => (
                <div key={b._id} className="book-item">
                    <div className="book-meta" onClick={() => onOpen?.(b)}>
                        <span className="book-title">{b.title}</span>
                        <span className="book-author">by {b.author}</span>
                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                            {b.genre && <span className="badge tag-genre">{b.genre}</span>}
                            {b.publishedYear && (
                                <span className="badge">{b.publishedYear}</span>
                            )}
                        </div>
                    </div>
                    <div className="book-actions">
                        {onEdit && (
                            <button className="btn secondary" onClick={() => onEdit(b)}>
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                className="btn secondary"
                                style={{ borderColor: "rgba(255,75,107,0.5)", color: "#ff4b6b" }}
                                onClick={() => onDelete(b)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {books.length === 0 && (
                <div className="book-item">
                    <span style={{ color: "var(--muted)" }}>No books yet.</span>
                </div>
            )}
        </div>
    );
};
