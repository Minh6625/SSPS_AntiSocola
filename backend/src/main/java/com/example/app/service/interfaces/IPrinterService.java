package com.example.app.service.interfaces;

import com.example.app.dto.PrinterResponseDTO;
import org.springframework.data.domain.Page;

public interface IPrinterService {
    Page<PrinterResponseDTO> getPrinters(
            String campus,
            String building,
            String status,
            Boolean colorPrinting,
            Boolean duplexPrinting,
            String keyword,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    PrinterResponseDTO getPrinterById(String printerId);
}
