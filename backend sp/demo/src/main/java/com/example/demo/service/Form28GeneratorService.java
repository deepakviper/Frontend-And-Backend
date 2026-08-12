package com.example.demo.service;

import com.example.demo.dto.PatentFormResponse;
import org.apache.poi.xwpf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class Form28GeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(Form28GeneratorService.class);

    // ------------------------------------------------------------------
    // MAIN ENTRY POINT
    // ------------------------------------------------------------------

    public byte[] generateForm28(PatentFormResponse data) {

        if (data == null) {
            data = new PatentFormResponse();
        }

        try (InputStream is = getTemplateInputStream("Form28MAIN.docx");
                XWPFDocument document = new XWPFDocument(is)) {

            Map<String, String> replacements = buildReplacementsMap(data);

            // 1. Replace in standalone paragraphs
            for (XWPFParagraph paragraph : new ArrayList<>(document.getParagraphs())) {
                replacePlaceholders(paragraph, replacements);
            }

            // 2. Replace inside all tables (AND nested tables inside them)
            if (document.getTables() != null) {
                for (XWPFTable table : document.getTables()) {
                    replaceInTable(table, replacements);
                }
            }

            try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
                document.write(bos);
                return bos.toByteArray();
            }

        } catch (Exception e) {
            logger.error("❌ ERROR DURING FORM 28 GENERATION", e);
            return new byte[0];
        }
    }

    // ------------------------------------------------------------------
    // RECURSIVE METHOD TO FIX THE TABLE ISSUE
    // ------------------------------------------------------------------
    private void replaceInTable(XWPFTable table, Map<String, String> replacements) {
        for (XWPFTableRow row : table.getRows()) {
            for (XWPFTableCell cell : row.getTableCells()) {

                // Replace text in the standard paragraphs of this cell
                for (XWPFParagraph paragraph : cell.getParagraphs()) {
                    replacePlaceholders(paragraph, replacements);
                }

                // If there is a table hidden INSIDE this cell, check it too!
                for (XWPFTable nestedTable : cell.getTables()) {
                    replaceInTable(nestedTable, replacements);
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // BUILD PLACEHOLDER MAP
    // ------------------------------------------------------------------

    private Map<String, String> buildReplacementsMap(PatentFormResponse data) {

        Map<String, String> map = new HashMap<>();

        // ✅ Principal Name (from frontend input)
        if (data.getPrincipal() != null && notBlank(data.getPrincipal().getName())) {
            map.put("{principal}", data.getPrincipal().getName());
        } else {
            map.put("{principal}", "");
        }

        // ✅ Nationality
        String nationality = "Indian";
        if (data.getApplicant() != null && notBlank(data.getApplicant().getNationality())) {
            nationality = data.getApplicant().getNationality();
        }
        map.put("{nation}", nationality);

        // ✅ Address (multi-line)
        map.put("{address}", buildMultiLineAddress(data));

        // ✅ FIXED: Hardcoded strictly to "Principal" as you requested
        map.put("{role}", "Principal");

        // ✅ FIXED: Hardcoded strictly to "Jeppiaar Institute of Technology" as you
        // requested
        map.put("{clg_name}", "Jeppiaar Institute of Technology");

        // ✅ Today's Date with ordinal (09th August 2026)
        LocalDate today = LocalDate.now();
        int day = today.getDayOfMonth();

        String formattedDate = day + getOrdinalSuffix(day) + " "
                + today.format(DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH))
                + " "
                + today.format(DateTimeFormatter.ofPattern("yyyy"));

        map.put("{date}", formattedDate);

        // Patent Office City
        String userCity = "Chennai";
        if (data.getApplicant() != null && data.getApplicant().getAddress() != null
                && notBlank(data.getApplicant().getAddress().getCity())) {
            userCity = data.getApplicant().getAddress().getCity().trim();
        }
        map.put("The Patent Office, at Chennai", "The Patent Office, at " + userCity);
        map.put("The Patent Office, Chennai", "The Patent Office, " + userCity);
        map.put("The Patent Office, at…..", "The Patent Office, at " + userCity);
        map.put("The Patent Office, at.....", "The Patent Office, at " + userCity);
        map.put("The Patent Office, at...", "The Patent Office, at " + userCity);
        map.put("The Patent Office, at..", "The Patent Office, at " + userCity);

        return map;
    }

    // ------------------------------------------------------------------
    // BUILD MULTI-LINE ADDRESS
    // ------------------------------------------------------------------

    private String buildMultiLineAddress(PatentFormResponse data) {

        if (data.getApplicant() == null || data.getApplicant().getAddress() == null) {
            return "";
        }

        PatentFormResponse.AddressDTO addr = data.getApplicant().getAddress();
        StringBuilder sb = new StringBuilder();

        // Include HouseNo and Street
        List<String> line1 = new ArrayList<>();
        if (notBlank(addr.getHouseNo()))
            line1.add(addr.getHouseNo());
        if (notBlank(addr.getStreet()))
            line1.add(addr.getStreet());
        if (!line1.isEmpty())
            sb.append(String.join(", ", line1));

        // Include City and District
        List<String> line2 = new ArrayList<>();
        if (notBlank(addr.getCity()))
            line2.add(addr.getCity());
        if (notBlank(addr.getDistrict()))
            line2.add(addr.getDistrict());
        if (!line2.isEmpty()) {
            if (sb.length() > 0)
                sb.append("\n");
            sb.append(String.join(", ", line2));
        }

        // State
        if (notBlank(addr.getState())) {
            if (sb.length() > 0)
                sb.append("\n");
            sb.append(addr.getState());
        }

        // Country - Pincode
        StringBuilder countryLine = new StringBuilder();
        if (notBlank(addr.getCountry())) {
            countryLine.append(addr.getCountry());
        } else {
            countryLine.append("India");
        }

        if (notBlank(addr.getPincode())) {
            countryLine.append(" - ").append(addr.getPincode());
        }

        if (sb.length() > 0)
            sb.append("\n");
        sb.append(countryLine);

        return sb.toString();
    }

    // ------------------------------------------------------------------
    // PLACEHOLDER REPLACER (Handles split runs + multiline)
    // ------------------------------------------------------------------

    private void replacePlaceholders(XWPFParagraph paragraph, Map<String, String> replacements) {

        if (paragraph == null)
            return;
        List<XWPFRun> runs = paragraph.getRuns();
        if (runs == null || runs.isEmpty())
            return;

        StringBuilder sb = new StringBuilder();
        for (XWPFRun run : runs) {
            String text = run.getText(0);
            if (text != null)
                sb.append(text);
        }

        String fullText = sb.toString();
        boolean replaced = false;

        for (Map.Entry<String, String> entry : replacements.entrySet()) {
            if (fullText.contains(entry.getKey())) {
                fullText = fullText.replace(entry.getKey(), entry.getValue());
                replaced = true;
            }
        }

        if (!replaced)
            return;

        XWPFRun baseRun = runs.get(0);

        String fontFamily = baseRun.getFontFamily();
        Double fontSize = baseRun.getFontSizeAsDouble();
        boolean isBold = baseRun.isBold();
        boolean isItalic = baseRun.isItalic();
        String color = baseRun.getColor();

        for (int i = runs.size() - 1; i >= 0; i--) {
            paragraph.removeRun(i);
        }

        String[] lines = fullText.split("\n", -1);

        for (int i = 0; i < lines.length; i++) {
            XWPFRun newRun = paragraph.createRun();
            newRun.setText(lines[i]);

            if (fontFamily != null)
                newRun.setFontFamily(fontFamily);
            if (fontSize != null && fontSize > 0)
                newRun.setFontSize(fontSize);
            newRun.setBold(isBold);
            newRun.setItalic(isItalic);
            if (color != null)
                newRun.setColor(color);

            if (i < lines.length - 1) {
                newRun.addBreak();
            }
        }
    }

    // ------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------

    private String getOrdinalSuffix(int day) {
        if (day >= 11 && day <= 13)
            return "th";
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private InputStream getTemplateInputStream(String filename) throws Exception {
        try {
            InputStream is = new ClassPathResource(filename).getInputStream();
            if (is != null) return is;
        } catch (Exception ignored) {}

        InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(filename);
        if (is != null) return is;

        is = Form28GeneratorService.class.getClassLoader().getResourceAsStream(filename);
        if (is != null) return is;

        is = Form28GeneratorService.class.getResourceAsStream("/" + filename);
        if (is != null) return is;

        throw new java.io.FileNotFoundException("Template file not found on classpath: " + filename);
    }
}