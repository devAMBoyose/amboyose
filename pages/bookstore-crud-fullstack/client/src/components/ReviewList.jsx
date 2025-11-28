export const ReviewList = ({ reviews }) => {
    if (!reviews?.length) {
        return <div className="error-text">No reviews yet. Be the first!</div>;
    }

    return (
        <div className="review-list">
            {reviews.map((r) => (
                <div key={r._id} className="review-item">
                    <div style={{ marginBottom: 2 }}>
                        <strong>{r.user?.name || "Anonymous"}</strong>{" "}
                        <span style={{ color: "var(--muted)" }}>
                            · {r.rating}/5 ⭐
                        </span>
                    </div>
                    <div>{r.comment}</div>
                </div>
            ))}
        </div>
    );
};
