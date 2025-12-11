import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const API_URL = "https://example.com/api/bamboard"; // placeholder for future API

// helper
function buildChart(existing, ctx, config) {
    if (!ctx) return existing;
    if (!existing) return new Chart(ctx, config);
    existing.data = config.data;
    existing.options = config.options;
    existing.update();
    return existing;
}

// demo data – no external API, always resolves immediately
async function fetchDashboardData() {
    return {
        miniBars: [
            [12, 14, 10, 18, 20],
            [7, 9, 6, 11, 8],
            [15, 16, 17, 19, 22],
            [4, 6, 7, 8, 10]
        ],
        transition: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            landing: [220, 250, 240, 260, 280, 320, 340],
            checkout: [120, 130, 160, 170, 190, 210, 230],
            conversion: [80, 90, 95, 110, 120, 140, 150]
        },
        valueTable: [
            { label: "Te tota", v2020: 12.5, v2021: 13.4, v2022: 6.5, v2023: 14.3 },
            { label: "Posse", v2020: 44.6, v2021: 45.6, v2022: 65.2, v2023: 88.2 },
            { label: "Vis an", v2020: 45.6, v2021: 45.5, v2022: 66.1, v2023: 78.2 },
            { label: "Facer", v2020: 35.6, v2021: 34.1, v2022: 62.2, v2023: 63.9 },
            { label: "Electram", v2020: 42.7, v2021: 48.8, v2022: 46.5, v2023: 45.7 }
        ],
        activity: {
            total: 125500,
            segments: [
                { label: "Cards", value: 32 },
                { label: "Bank transfer", value: 22 },
                { label: "Wallet", value: 18 },
                { label: "Refunds", value: 15 },
                { label: "Other", value: 13 }
            ]
        },
        kpi: {
            mainValue: 72
        },
        sales: {
            customers: 2254,
            labels: ["A", "B", "C", "D", "E"],
            values: [12, 18, 9, 14, 7]
        },
        finance: {
            total: 715.8,
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            cashIn: [120, 150, 130, 160, 170, 190],
            cashOut: [80, 90, 95, 110, 110, 120],
            profit: [40, 60, 35, 50, 60, 70]
        },
        product: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            teTota: [14, 16, 15, 18, 17, 19],
            facer: [11, 10, 9, 12, 11, 13]
        }
    };
}

function App() {
    const [data, setData] = useState(null);

    // THEME STATE (dark / light)
    const [theme, setTheme] = useState("dark");

    // apply theme to <html data-theme="...">
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleThemeChange = (mode) => {
        setTheme(mode);
    };

    // main charts
    const mini1Ref = useRef(null);
    const mini2Ref = useRef(null);
    const mini3Ref = useRef(null);
    const mini4Ref = useRef(null);
    const transitionRef = useRef(null);
    const valuePieRef = useRef(null);

    const activityRef = useRef(null);
    const kpiRef = useRef(null);
    const salesRef = useRef(null);
    const financeRef = useRef(null);
    const productRef = useRef(null);

    // NEW mini-dashboard charts
    const salesSnapRef = useRef(null);
    const financeSnapRef = useRef(null);
    const productSnapRef = useRef(null);

    const chartsRef = useRef({
        mini: [],
        transition: null,
        activity: null,
        kpi: null,
        sales: null,
        finance: null,
        product: null,
        valuePie: null,
        salesSnap: null,
        financeSnap: null,
        productSnap: null
    });

    const loadData = async () => {
        const result = await fetchDashboardData();
        setData(result);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!data) return;

        // ---------- MINI BAR CARDS ----------
        const miniRefs = [mini1Ref, mini2Ref, mini3Ref, mini4Ref];
        const miniColors = ["#38bdf8", "#4ade80", "#fde047", "#f472b6"];

        data.miniBars.forEach((arr, idx) => {
            const ctx = miniRefs[idx].current?.getContext("2d");
            chartsRef.current.mini[idx] = buildChart(
                chartsRef.current.mini[idx],
                ctx,
                {
                    type: "bar",
                    data: {
                        labels: arr.map((_, i) => i + 1),
                        datasets: [
                            {
                                data: arr,
                                backgroundColor: miniColors[idx],
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { display: false }, y: { display: false } }
                    }
                }
            );
        });

        // ---------- TRANSITION ----------
        chartsRef.current.transition = buildChart(
            chartsRef.current.transition,
            transitionRef.current?.getContext("2d"),
            {
                type: "line",
                data: {
                    labels: data.transition.labels,
                    datasets: [
                        {
                            label: "Landing",
                            data: data.transition.landing,
                            borderColor: "#f472b6",
                            backgroundColor: "rgba(244,114,182,0.12)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 2.8
                        },
                        {
                            label: "Checkout",
                            data: data.transition.checkout,
                            borderColor: "#fde047",
                            backgroundColor: "rgba(252,211,77,0.12)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 2.8
                        },
                        {
                            label: "Conversion",
                            data: data.transition.conversion,
                            borderColor: "#4ade80",
                            backgroundColor: "rgba(74,222,128,0.12)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 2.8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: "#9ca3af", font: { size: 10 } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: "#9ca3af", font: { size: 10 } }
                        },
                        y: {
                            grid: { color: "rgba(148,163,184,0.25)" },
                            ticks: { color: "#9ca3af", font: { size: 10 } }
                        }
                    }
                }
            }
        );

        // ---------- ACTIVITY ----------
        chartsRef.current.activity = buildChart(
            chartsRef.current.activity,
            activityRef.current?.getContext("2d"),
            {
                type: "doughnut",
                data: {
                    labels: data.activity.segments.map((s) => s.label),
                    datasets: [
                        {
                            data: data.activity.segments.map((s) => s.value),
                            backgroundColor: ["#38bdf8", "#f472b6", "#fde047", "#4ade80", "#818cf8"],
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: "#9ca3af", font: { size: 10 }, boxWidth: 10 }
                        }
                    }
                }
            }
        );

        // ---------- KPI ----------
        chartsRef.current.kpi = buildChart(
            chartsRef.current.kpi,
            kpiRef.current?.getContext("2d"),
            {
                type: "doughnut",
                data: {
                    datasets: [
                        {
                            data: [data.kpi.mainValue, 100 - data.kpi.mainValue],
                            backgroundColor: ["#38bdf8", "#020617"],
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    rotation: -90,
                    circumference: 180,
                    cutout: "75%",
                    plugins: { legend: { display: false } }
                }
            }
        );

        // ---------- SALES ----------
        chartsRef.current.sales = buildChart(
            chartsRef.current.sales,
            salesRef.current?.getContext("2d"),
            {
                type: "bar",
                data: {
                    labels: data.sales.labels,
                    datasets: [
                        {
                            label: "Sales",
                            data: data.sales.values,
                            backgroundColor: "#38bdf8",
                            borderRadius: 6,
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            grid: { color: "rgba(148,163,184,0.25)" },
                            ticks: { color: "#9ca3af", font: { size: 10 } }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: "#9ca3af", font: { size: 10 } }
                        }
                    }
                }
            }
        );

        // ---------- FINANCE ----------
        chartsRef.current.finance = buildChart(
            chartsRef.current.finance,
            financeRef.current?.getContext("2d"),
            {
                type: "line",
                data: {
                    labels: data.finance.labels,
                    datasets: [
                        {
                            label: "Cash In",
                            data: data.finance.cashIn,
                            borderColor: "#38bdf8",
                            backgroundColor: "rgba(56,189,248,0.08)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 2.5
                        },
                        {
                            label: "Cash Out",
                            data: data.finance.cashOut,
                            borderColor: "#fb7185",
                            backgroundColor: "rgba(248,113,113,0.08)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 2.5
                        },
                        {
                            label: "Profit",
                            data: data.finance.profit,
                            borderColor: "#4ade80",
                            borderDash: [5, 5],
                            tension: 0.4,
                            pointRadius: 2.5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: "#9ca3af", font: { size: 10 } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: "#9ca3af", font: { size: 10 } }
                        },
                        y: {
                            grid: { color: "rgba(148,163,184,0.25)" },
                            ticks: { color: "#9ca3af", font: { size: 10 } }
                        }
                    }
                }
            }
        );

        // ---------- PRODUCT ----------
        chartsRef.current.product = buildChart(
            chartsRef.current.product,
            productRef.current?.getContext("2d"),
            {
                type: "radar",
                data: {
                    labels: data.product.labels,
                    datasets: [
                        {
                            label: "Te tota",
                            data: data.product.teTota,
                            borderColor: "#38bdf8",
                            backgroundColor: "rgba(56,189,248,0.25)",
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: "#38bdf8"
                        },
                        {
                            label: "Facer",
                            data: data.product.facer,
                            borderColor: "#f472b6",
                            backgroundColor: "rgba(244,114,182,0.25)",
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: "#f472b6"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: "#9ca3af", font: { size: 10 } }
                        }
                    },
                    scales: {
                        r: {
                            angleLines: { color: "rgba(148,163,184,0.15)" },
                            grid: { color: "rgba(15,23,42,0.9)" },
                            ticks: {
                                display: false,
                                backdropColor: "transparent"
                            },
                            pointLabels: {
                                color: "#9ca3af",
                                font: { size: 10 }
                            }
                        }
                    }
                }
            }
        );

        // ---------- NEW MINI DASHBOARDS ----------

        // Sales Snapshot – tiny line/area chart
        chartsRef.current.salesSnap = buildChart(
            chartsRef.current.salesSnap,
            salesSnapRef.current?.getContext("2d"),
            {
                type: "line",
                data: {
                    labels: data.sales.labels,
                    datasets: [
                        {
                            data: data.sales.values,
                            borderColor: "#38bdf8",
                            backgroundColor: "rgba(56,189,248,0.18)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            }
        );

        // Finance Snapshot – mini profit line
        chartsRef.current.financeSnap = buildChart(
            chartsRef.current.financeSnap,
            financeSnapRef.current?.getContext("2d"),
            {
                type: "line",
                data: {
                    labels: data.finance.labels,
                    datasets: [
                        {
                            data: data.finance.profit,
                            borderColor: "#4ade80",
                            backgroundColor: "rgba(74,222,128,0.18)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            }
        );

        // Product Snapshot – polar area Te tota vs Facer
        chartsRef.current.productSnap = buildChart(
            chartsRef.current.productSnap,
            productSnapRef.current?.getContext("2d"),
            {
                type: "polarArea",
                data: {
                    labels: ["Te tota", "Facer"],
                    datasets: [
                        {
                            data: [
                                data.product.teTota.reduce((a, b) => a + b, 0),
                                data.product.facer.reduce((a, b) => a + b, 0)
                            ],
                            backgroundColor: ["rgba(56,189,248,0.85)", "rgba(244,114,182,0.85)"],
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            }
        );
    }, [data]);

    if (!data) {
        return (
            <main className="dash-shell">
                <p style={{ color: "#e5e7eb" }}>Loading BamBoard…</p>
            </main>
        );
    }

    return (
        <main className="dash-shell">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">BamBoard · Finance Dashboard</h1>
                    <p className="dash-subtitle">
                        React · Chart.js · Neon Theme · {theme === "dark" ? "Dark" : "Light"} mode
                    </p>
                </div>

                <div className="dash-controls">
                    <button className="pill">Last 30 days</button>

                    <button className="pill pill-primary" onClick={loadData}>
                        Refresh Data
                    </button>

                    {/* Sun / Moon toggle */}
                    <div className="theme-toggle" aria-label="Theme toggle">
                        <button
                            type="button"
                            className={`theme-btn ${theme === "light" ? "is-active" : ""}`}
                            onClick={() => handleThemeChange("light")}
                        >
                            <i className="fa-regular fa-sun" aria-hidden="true"></i>
                        </button>
                        <button
                            type="button"
                            className={`theme-btn ${theme === "dark" ? "is-active" : ""}`}
                            onClick={() => handleThemeChange("dark")}
                        >
                            <i className="fa-regular fa-moon" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </header>

            {/* TOP MINI STRIP */}
            <section className="strip">
                <article className="strip-card">
                    <h2 className="strip-title">Revenue Streams</h2>
                    <div className="strip-row">
                        <div className="strip-metric">
                            <span className="label">Facer</span>
                            <span className="value up">+15%</span>
                        </div>
                        <div className="chart-wrap chart-mini">
                            <canvas ref={mini1Ref} />
                        </div>
                    </div>
                </article>

                <article className="strip-card">
                    <h2 className="strip-title">Subscriptions</h2>
                    <div className="strip-row">
                        <div className="strip-metric">
                            <span className="label">Vis an</span>
                            <span className="value down">-2%</span>
                        </div>
                        <div className="chart-wrap chart-mini">
                            <canvas ref={mini2Ref} />
                        </div>
                    </div>
                </article>

                <article className="strip-card">
                    <h2 className="strip-title">Enterprise</h2>
                    <div className="strip-row">
                        <div className="strip-metric">
                            <span className="label">Posse</span>
                            <span className="value up">+18%</span>
                        </div>
                        <div className="chart-wrap chart-mini">
                            <canvas ref={mini3Ref} />
                        </div>
                    </div>
                </article>

                <article className="strip-card">
                    <h2 className="strip-title">Freemium</h2>
                    <div className="strip-row">
                        <div className="strip-metric">
                            <span className="label">Te tota</span>
                            <span className="value down">-5%</span>
                        </div>
                        <div className="chart-wrap chart-mini">
                            <canvas ref={mini4Ref} />
                        </div>
                    </div>
                </article>
            </section>

            {/* MAIN GRID */}
            <section className="grid">
                {/* big charts */}
                <article className="card card-transition">
                    <div className="card-header">
                        <h2 className="card-title">Transition</h2>
                        <span className="card-tag">Traffic Conversion</span>
                    </div>
                    <div className="chart-wrap">
                        <canvas ref={transitionRef} />
                    </div>
                </article>

                <article className="card card-table">
                    <div className="card-header">
                        <h2 className="card-title">Dynamics of Value</h2>
                        <span className="card-tag">Yearly</span>
                    </div>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Segment</th>
                                <th>2020</th>
                                <th>2021</th>
                                <th>2022</th>
                                <th>2023</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.valueTable.map((row) => (
                                <tr key={row.label}>
                                    <td>{row.label}</td>
                                    <td>{row.v2020}</td>
                                    <td>{row.v2021}</td>
                                    <td>{row.v2022}</td>
                                    <td>{row.v2023}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </article>

                <article className="card card-activity">
                    <div className="card-header">
                        <h2 className="card-title">Activity</h2>
                    </div>
                    <div className="chart-wrap chart-circle">
                        <canvas ref={activityRef} />
                    </div>
                </article>

                <article className="card card-kpi">
                    <div className="card-header">
                        <h2 className="card-title">Engagement Pulse</h2>
                    </div>
                    <div className="chart-wrap chart-circle">
                        <canvas ref={kpiRef} />
                    </div>
                </article>

                <article className="card card-sales">
                    <div className="card-header">
                        <h2 className="card-title">Sales Data</h2>
                    </div>
                    <div className="chart-wrap">
                        <canvas ref={salesRef} />
                    </div>
                </article>

                <article className="card card-finance">
                    <div className="card-header">
                        <h2 className="card-title">Finance Lines</h2>
                    </div>
                    <div className="chart-wrap">
                        <canvas ref={financeRef} />
                    </div>
                </article>

                <article className="card card-product">
                    <div className="card-header">
                        <h2 className="card-title">Product Statistic</h2>
                    </div>
                    <div className="chart-wrap">
                        <canvas ref={productRef} />
                    </div>
                </article>

                {/* MINI DASHBOARDS WITH THEIR OWN CHARTS */}
                <article className="card card-summary">
                    <div className="card-header">
                        <h2 className="card-title">Sales Snapshot</h2>
                    </div>
                    <div className="chart-wrap chart-mini">
                        <canvas ref={salesSnapRef} />
                    </div>
                    <div className="summary-body">
                        <div className="summary-row">
                            <span className="summary-label">Customers</span>
                            <span className="summary-value">
                                {data.sales.customers.toLocaleString()}
                            </span>
                        </div>
                        <div className="summary-row summary-trend summary-trend-down">
                            <span className="summary-icon">▼</span>
                            <span>-4% (month)</span>
                        </div>
                    </div>
                </article>

                <article className="card card-summary">
                    <div className="card-header">
                        <h2 className="card-title">Finance Snapshot</h2>
                    </div>
                    <div className="chart-wrap chart-mini">
                        <canvas ref={financeSnapRef} />
                    </div>
                    <div className="summary-body">
                        <div className="summary-row">
                            <span className="summary-label">Period</span>
                            <span className="summary-value">January 2021</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">
                                {data.finance.total.toFixed(1)} $
                            </span>
                        </div>
                        <div className="summary-row summary-trend summary-trend-up">
                            <span className="summary-icon">▲</span>
                            <span>
                                +9% (+{(data.finance.total * 0.09).toFixed(1)} $)
                            </span>
                        </div>
                    </div>
                </article>

                <article className="card card-summary">
                    <div className="card-header">
                        <h2 className="card-title">Product Snapshot</h2>
                    </div>
                    <div className="chart-wrap chart-mini">
                        <canvas ref={productSnapRef} />
                    </div>
                    <div className="summary-body">
                        <div className="summary-row">
                            <span className="summary-label">Te tota</span>
                            <span className="summary-value summary-up">
                                114.8 $ <span className="summary-small">+15.4%</span>
                            </span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Facer</span>
                            <span className="summary-value summary-down">
                                87.55 $ <span className="summary-small">-19.4%</span>
                            </span>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    );
}

export default App;
