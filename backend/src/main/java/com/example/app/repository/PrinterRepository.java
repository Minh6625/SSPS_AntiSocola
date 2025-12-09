package com.example.app.repository;

import com.example.app.entity.Printer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Repository for Printer entity with dynamic filtering support.
 */
public interface PrinterRepository extends JpaRepository<Printer, String>, JpaSpecificationExecutor<Printer> {
}
