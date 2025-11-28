import { useState } from "react";

export const BookForm = ({ onSave, initial }) => {
    const [form, setForm] = useState(
        initial || {
            title: "",
            author: "",
            description: "",
            publishedYear: "",
            genre: ""
        }
    );

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            publishedYear: form.publishedYear
                ? Number(form.publishedYear)
                : undefined
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Title
                <input name="title" value={form.title} onChange={handleChange} />
            </label>
            <label>
                Author
                <input name="author" value={form.author} onChange={handleChange} />
            </label>
            <label>
                Genre
                <input name="genre" value={form.genre} onChange={handleChange} />
            </label>
            <label>
                Published Year
                <input
                    name="publishedYear"
                    value={form.publishedYear}
                    onChange={handleChange}
                />
            </label>
            <label>
                Description
                <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                />
            </label>
            <button className="btn" type="submit">
                Save Book
            </button>
        </form>
    );
};
