import "../styles/portfolio.css";

export const PortfolioShell = ({ children }) => {
    return (
        <div className="app-root">
            <div className="window-shell">
                <header className="window-header">
                    <div className="window-dots">
                        <span className="window-dot red" />
                        <span className="window-dot yellow" />
                        <span className="window-dot green" />
                    </div>
                    <span className="window-title">BookstoreCrud.java · Fullstack Demo</span>
                </header>
                <main className="window-body">{children}</main>
            </div>
        </div>
    );
};
