package bam.fxconverter;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FxService {

    // Simple demo table of FX rates (base = USD)
    // Para stable kahit walang internet or may problema yung real API.
    private static final Map<String, Double> USD_RATES = new HashMap<>();

    static {
        // 1 USD = X CURRENCY
        USD_RATES.put("USD", 1.0);
        USD_RATES.put("PHP", 58.0);
        USD_RATES.put("EUR", 0.92);
        USD_RATES.put("JPY", 155.0);
    }

    public double convert(String from, String to, double amount) {
        double rate = getRate(from, to);
        return amount * rate;
    }

    private double getRate(String from, String to) {
        // Same currency
        if (from.equalsIgnoreCase(to)) {
            return 1.0;
        }

        // Normalize codes
        from = from.toUpperCase();
        to = to.toUpperCase();

        // Case 1: from USD -> to X
        if ("USD".equals(from)) {
            Double toRate = USD_RATES.get(to);
            if (toRate == null) {
                throw new RuntimeException("Unsupported currency: " + to);
            }
            return toRate;
        }

        // Case 2: from X -> to USD
        if ("USD".equals(to)) {
            Double fromRate = USD_RATES.get(from);
            if (fromRate == null) {
                throw new RuntimeException("Unsupported currency: " + from);
            }
            return 1.0 / fromRate;
        }

        // Case 3: from X -> to Y (via USD)
        Double fromRate = USD_RATES.get(from);
        Double toRate = USD_RATES.get(to);
        if (fromRate == null || toRate == null) {
            throw new RuntimeException("Unsupported currency pair: " + from + " -> " + to);
        }

        // Example: EUR -> PHP
        // 1 EUR = (USD / EUR) * (PHP / USD)
        double usdPerFrom = 1.0 / fromRate;
        return usdPerFrom * toRate;
    }
}
