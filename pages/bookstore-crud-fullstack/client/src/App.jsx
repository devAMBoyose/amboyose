import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PortfolioShell } from "./components/PortfolioShell";
import { Navbar } from "./components/Navbar";
import { BooksPage } from "./pages/BooksPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { BookDetailsPage } from "./pages/BookDetailsPage";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <PortfolioShell>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<BooksPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/books/:id"
                            element={
                                <ProtectedRoute>
                                    <BookDetailsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </PortfolioShell>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
