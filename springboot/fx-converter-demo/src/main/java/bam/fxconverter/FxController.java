package bam.fxconverter;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class FxController {

    private final FxService fxService;

    public FxController(FxService fxService) {
        this.fxService = fxService;
    }

    // UI page
    @GetMapping("/")
    public String home() {
        return "fx-converter"; // templates/fx-converter.html
    }

    @GetMapping("/fx")
    public String fxPage() {
        return "fx-converter";
    }

    // API endpoint
    @GetMapping("/api/fx/convert")
    @ResponseBody
    public Map<String, Object> convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam double amount) {

        double converted = fxService.convert(from, to, amount);

        return Map.of(
                "from", from,
                "to", to,
                "amount", amount,
                "converted", converted);
    }
}
