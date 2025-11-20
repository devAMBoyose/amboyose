package bamworldbank.setting;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @PostMapping
    public ResponseEntity<Map<String, Object>> updateSettings(
            @RequestBody Map<String, Object> payload) {

        // For demo: just echo back
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "received", payload));
    }
}
