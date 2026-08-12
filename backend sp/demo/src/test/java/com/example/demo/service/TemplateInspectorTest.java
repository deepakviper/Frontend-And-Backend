package com.example.demo.service;

import com.example.demo.dto.PatentFormResponse;
import org.apache.poi.xwpf.usermodel.*;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

public class TemplateInspectorTest {

    @Test
    public void testGeneratorsWithCustomCityAndPrincipal() throws Exception {
        PatentFormResponse data = new PatentFormResponse();
        data.setTitleOfInvention("AI BASED PATENT AUTOMATION SYSTEM");

        PatentFormResponse.ApplicantDTO applicant = data.getApplicant();
        applicant.setName("JEPPIAAR INSTITUTE OF TECHNOLOGY");
        applicant.setNationality("Indian");
        applicant.setCountry("India");

        PatentFormResponse.AddressDTO addr = applicant.getAddress();
        addr.setHouseNo("123");
        addr.setStreet("Kunnam, Sunguvarchatram");
        addr.setCity("Mumbai"); // Test custom city
        addr.setState("Maharashtra");
        addr.setCountry("India");
        addr.setPincode("400001");

        PatentFormResponse.PrincipalDTO principal = data.getPrincipal();
        principal.setName("Dr. V. Veerapandiyan");
        principal.setDesignation("Principal");
        principal.setTelephone("044-27159000");
        principal.setMobile("9876543210");
        principal.setFax("044-27159001");
        principal.setEmail("principal@jeppiaar.ac.in");

        PatentFormResponse.InventorDTO inv1 = new PatentFormResponse.InventorDTO();
        inv1.setName("R. MUTHU");
        inv1.setNationality("Indian");
        inv1.setCountry("India");
        data.getInventors().add(inv1);

        DocumentGeneratorService form1Service = new DocumentGeneratorService();
        Form3GeneratorService form3Service = new Form3GeneratorService();
        Form5GeneratorService form5Service = new Form5GeneratorService();
        Form9GeneratorService form9Service = new Form9GeneratorService();
        Form28GeneratorService form28Service = new Form28GeneratorService();

        verifyDoc("Form 1", form1Service.generateFilledForm1(data));
        verifyDoc("Form 3", form3Service.generateForm3(data));
        verifyDoc("Form 5", form5Service.generateForm5(data));
        verifyDoc("Form 9", form9Service.generateForm9(data));
        verifyDoc("Form 28", form28Service.generateForm28(data));
    }

    @Test
    public void testCurlPayloadWithEmptyFields() throws Exception {
        String jsonPayload = "{\"applicant\":{\"name\":\"\",\"email\":\"\",\"address\":{\"houseNo\":\"\",\"street\":\"\",\"city\":\"\",\"state\":\"\",\"country\":\"\",\"pincode\":\"\"}},\"principal\":{\"name\":\"\",\"designation\":\"Principal\",\"telephone\":\"\",\"mobile\":\"\",\"fax\":\"\",\"email\":\"\"},\"inventors\":[]}";
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper()
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        PatentFormResponse data = mapper.readValue(jsonPayload, PatentFormResponse.class);

        DocumentGeneratorService form1Service = new DocumentGeneratorService();
        Form2GeneratorService form2Service = new Form2GeneratorService();
        Form3GeneratorService form3Service = new Form3GeneratorService();
        Form5GeneratorService form5Service = new Form5GeneratorService();
        Form9GeneratorService form9Service = new Form9GeneratorService();
        Form28GeneratorService form28Service = new Form28GeneratorService();

        byte[] f1 = form1Service.generateFilledForm1(data);
        byte[] f2 = form2Service.generateForm2(data, null);
        byte[] f3 = form3Service.generateForm3(data);
        byte[] f5 = form5Service.generateForm5(data);
        byte[] f9 = form9Service.generateForm9(data);
        byte[] f28 = form28Service.generateForm28(data);

        org.junit.jupiter.api.Assertions.assertTrue(f1.length > 0, "Form 1 should not be empty");
        org.junit.jupiter.api.Assertions.assertTrue(f2.length > 0, "Form 2 should not be empty");
        org.junit.jupiter.api.Assertions.assertTrue(f3.length > 0, "Form 3 should not be empty");
        org.junit.jupiter.api.Assertions.assertTrue(f5.length > 0, "Form 5 should not be empty");
        org.junit.jupiter.api.Assertions.assertTrue(f9.length > 0, "Form 9 should not be empty");
        org.junit.jupiter.api.Assertions.assertTrue(f28.length > 0, "Form 28 should not be empty");
    }

    private void verifyDoc(String label, byte[] docBytes) throws Exception {
        System.out.println("==================================================");
        System.out.println("VERIFYING GENERATED DOC: " + label);
        System.out.println("==================================================");

        try (InputStream is = new ByteArrayInputStream(docBytes);
             XWPFDocument doc = new XWPFDocument(is)) {

            for (XWPFParagraph p : doc.getParagraphs()) {
                String text = p.getText();
                if (text != null && (text.contains("Patent Office") || text.contains("Mumbai") || text.contains("Veerapandiyan") || text.contains("9876543210"))) {
                    System.out.println("PARAGRAPH MATCH: " + text);
                }
            }

            for (XWPFTable t : doc.getTables()) {
                verifyTable(t);
            }
        }
    }

    private void verifyTable(XWPFTable table) {
        for (XWPFTableRow r : table.getRows()) {
            for (XWPFTableCell c : r.getTableCells()) {
                String text = c.getText();
                if (text != null && (text.contains("Patent Office") || text.contains("Mumbai") || text.contains("Veerapandiyan") || text.contains("9876543210") || text.contains("SERVICE"))) {
                    System.out.println("TABLE CELL MATCH: " + text.replace("\n", " | "));
                }
                for (XWPFTable nested : c.getTables()) {
                    verifyTable(nested);
                }
            }
        }
    }
}
