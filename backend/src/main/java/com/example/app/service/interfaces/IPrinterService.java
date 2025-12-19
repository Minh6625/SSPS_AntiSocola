package com.example.app.service.interfaces;

import com.example.app.dto.PrinterRequestDTO;
import com.example.app.dto.PrinterResponseDTO;
import org.springframework.data.domain.Page;

public interface IPrinterService {
    Page<PrinterResponseDTO> getPrinters(
            String campus,
            String building,
            String room,
            String brand,
            String model,
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
    
    PrinterResponseDTO createPrinter(PrinterRequestDTO request, String username);
    
    PrinterResponseDTO updatePrinter(Long printerId, PrinterRequestDTO request);
    
    PrinterResponseDTO togglePrinterStatus(Long printerId);
    
    void deletePrinter(Long printerId);
}
