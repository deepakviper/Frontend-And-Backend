package com.example.demo.controller;

import com.example.demo.dto.PatentFormResponse;
import com.example.demo.service.DocumentGeneratorService;
import com.example.demo.service.DocumentParserService;
import com.example.demo.service.Form2GeneratorService;
import com.example.demo.service.Form3GeneratorService;
import com.example.demo.service.Form5GeneratorService;
import com.example.demo.service.Form9GeneratorService;
import com.example.demo.service.Form28GeneratorService;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/patent")
@CrossOrigin(origins = "*")
public class PatentController {

    @Autowired
    private DocumentParserService parserService;

    @Autowired
    private DocumentGeneratorService generatorService;

    @Autowired
    private Form2GeneratorService form2Service;

    @Autowired
    private Form3GeneratorService form3Service;

    @Autowired
    private Form5GeneratorService form5Service;

    @Autowired
    private Form9GeneratorService form9Service; // ✅ NEW
    @Autowired
    private Form28GeneratorService form28Service;

    // Reusable JSON mapper — ignores unknown fields to prevent crashes
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // ------------------------------------------------------------------
    // /parse — Extract patent data from uploaded document
    // ------------------------------------------------------------------
    @PostMapping("/parse")
    public ResponseEntity<PatentFormResponse> parsePatentDocument(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            PatentFormResponse responseData = parserService.parseUploadedDocument(file);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ------------------------------------------------------------------
    // /download — Generate filled patent form
    // Handles BOTH JSON bodies and multipart/form-data / query params
    // ------------------------------------------------------------------
    @PostMapping(value = "/download", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> downloadFilledFormJson(
            @RequestBody java.util.Map<String, Object> payload,
            @RequestParam(value = "formType", required = false) String formTypeParam) {
        try {
            String formType = formTypeParam;
            if (formType == null || formType.isBlank()) {
                if (payload.containsKey("formType")) {
                    formType = String.valueOf(payload.get("formType"));
                } else if (payload.containsKey("requestedForms") && payload.get("requestedForms") instanceof java.util.List) {
                    java.util.List<?> list = (java.util.List<?>) payload.get("requestedForms");
                    if (!list.isEmpty()) {
                        formType = String.valueOf(list.get(0));
                    }
                }
            }
            if (formType == null || formType.isBlank()) {
                formType = "form1";
            }

            PatentFormResponse finalData = objectMapper.convertValue(payload, PatentFormResponse.class);
            return generateFormResponse(finalData, null, formType);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/download", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<byte[]> downloadFilledForm(
            @RequestParam(value = "data", required = false) String dataJson,
            @RequestParam(value = "sourceFile", required = false) MultipartFile sourceFile,
            @RequestParam(value = "formType", defaultValue = "form1") String formType) {

        try {
            if (dataJson == null || dataJson.isBlank()) {
                dataJson = "{}";
            }

            PatentFormResponse finalData = objectMapper.readValue(dataJson, PatentFormResponse.class);
            byte[] sourceFileBytes = (sourceFile != null && !sourceFile.isEmpty())
                    ? sourceFile.getBytes()
                    : null;

            return generateFormResponse(finalData, sourceFileBytes, formType);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private ResponseEntity<byte[]> generateFormResponse(PatentFormResponse finalData, byte[] sourceFileBytes, String formType) {
        try {
            byte[] documentBytes;
            String filename;

            System.out.println("========== DOWNLOAD REQUEST ==========");
            System.out.println("Form type: " + formType);
            System.out.println("======================================");

            if ("form9".equalsIgnoreCase(formType)) {
                documentBytes = form9Service.generateForm9(finalData);
                filename = "Filled_Patent_Form_9.docx";
            } else if ("form5".equalsIgnoreCase(formType)) {
                documentBytes = form5Service.generateForm5(finalData);
                filename = "Filled_Patent_Form_5.docx";
            } else if ("form3".equalsIgnoreCase(formType)) {
                documentBytes = form3Service.generateForm3(finalData);
                filename = "Filled_Patent_Form_3.docx";
            } else if ("form2".equalsIgnoreCase(formType)) {
                documentBytes = form2Service.generateForm2(finalData, sourceFileBytes);
                filename = "Filled_Patent_Form_2.docx";
            } else if ("form28".equalsIgnoreCase(formType)) {
                documentBytes = form28Service.generateForm28(finalData);
                filename = "Filled_Patent_Form_28.docx";
            } else {
                documentBytes = generatorService.generateFilledForm1(finalData);
                filename = "Filled_Patent_Form_1.docx";
            }

            if (documentBytes == null || documentBytes.length == 0) {
                System.err.println("❌ ERROR: Document generation failed or produced 0 bytes for formType: " + formType);
                return ResponseEntity.internalServerError().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .body(documentBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}