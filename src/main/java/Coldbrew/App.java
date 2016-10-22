package Coldbrew;

import com.mitchellbosecke.pebble.loader.ClasspathLoader;
import org.eclipse.jetty.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.ModelAndView;
import spark.TemplateEngine;
import spark.template.pebble.PebbleTemplateEngine;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import static spark.Spark.*;

public class App {

    private static final String CFG_DIR = "config";

    private static final Logger LOG = LoggerFactory.getLogger(App.class);

    private final Properties _config;
    private final TemplateEngine _templateEngine;

    public static void main(String[] args) throws IOException {
        final Properties config = loadConfigs();
        new App(config).run();
    }

    public App(final Properties pConfig) {
        _config = pConfig;

        ClasspathLoader classpathLoader = new ClasspathLoader();
        classpathLoader.setPrefix(_config.getProperty("templates.pebble.prefix", "templates"));
        classpathLoader.setSuffix(_config.getProperty("templates.pebble.suffix", ".html"));
        _templateEngine = new PebbleTemplateEngine(classpathLoader);
    }

    private static Properties loadConfigs() throws IOException {
        final Properties config = new Properties();

        final List<String> filePaths = Files.walk(Paths.get(CFG_DIR))
            .map(Path::toString)
            .filter(p -> p.endsWith(".properties"))
            .filter(p -> !p.endsWith("example.properties"))
            .collect(Collectors.toList());

        for (final String path : filePaths) {
            LOG.debug("Loading configs from {}", path);
            final FileInputStream inputStream = new FileInputStream(path);
            config.load(inputStream);
            inputStream.close();
        }

        return config;
    }

    private void run() {

        staticFiles.location(_config.getProperty("spark.staticFiles", "/public"));

        after((req, res) -> {
            // Using res.status() here throws a NPE.
            // Should be fixed with spark 2.6, which currently has no release date.
            LOG.debug("{} {} -> {}", req.requestMethod(), req.url(), res.raw().getStatus());
        });

        exception(Exception.class, (e, req, res) -> {
            LOG.error(req.uri(), e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR_500);
            res.body(HttpStatus.getMessage(HttpStatus.INTERNAL_SERVER_ERROR_500));
        });

        get("/", (req, res) -> new ModelAndView(Collections.emptyMap(), "index"), _templateEngine);

    }

}
