// client/src/pages/NotFound.jsx

export const NotFound = () => {
    return (
        <div className="panel">
            <div className="panel-header">
                <span className="panel-title">404 · Route Not Found</span>
                <span className="chip">Bookstore CRUD</span>
            </div>
            <p>
                The page you’re looking for does not exist. Use the navigation above to
                go back to the Books dashboard, or try another URL.
            </p>
        </div>
    );
};
