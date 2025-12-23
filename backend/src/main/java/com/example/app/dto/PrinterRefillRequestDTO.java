package com.example.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * DTO: Request để nạp giấy/mực cho máy in
 */
public class PrinterRefillRequestDTO {
    
    @Min(value = 0, message = "Số tờ giấy A4 phải >= 0")
    private Integer a4PaperToAdd;
    
    @Min(value = 0, message = "Số tờ giấy A3 phải >= 0")
    private Integer a3PaperToAdd;
    
    @Min(value = 0, message = "Mực đen phải >= 0")
    @Max(value = 100, message = "Mực đen phải <= 100")
    private Integer tonerBlackToAdd;
    
    @Min(value = 0, message = "Mực xanh phải >= 0")
    @Max(value = 100, message = "Mực xanh phải <= 100")
    private Integer tonerCyanToAdd;
    
    @Min(value = 0, message = "Mực đỏ phải >= 0")
    @Max(value = 100, message = "Mực đỏ phải <= 100")
    private Integer tonerMagentaToAdd;
    
    @Min(value = 0, message = "Mực vàng phải >= 0")
    @Max(value = 100, message = "Mực vàng phải <= 100")
    private Integer tonerYellowToAdd;

    public Integer getA4PaperToAdd() {
        return a4PaperToAdd;
    }

    public void setA4PaperToAdd(Integer a4PaperToAdd) {
        this.a4PaperToAdd = a4PaperToAdd;
    }

    public Integer getA3PaperToAdd() {
        return a3PaperToAdd;
    }

    public void setA3PaperToAdd(Integer a3PaperToAdd) {
        this.a3PaperToAdd = a3PaperToAdd;
    }

    public Integer getTonerBlackToAdd() {
        return tonerBlackToAdd;
    }

    public void setTonerBlackToAdd(Integer tonerBlackToAdd) {
        this.tonerBlackToAdd = tonerBlackToAdd;
    }

    public Integer getTonerCyanToAdd() {
        return tonerCyanToAdd;
    }

    public void setTonerCyanToAdd(Integer tonerCyanToAdd) {
        this.tonerCyanToAdd = tonerCyanToAdd;
    }

    public Integer getTonerMagentaToAdd() {
        return tonerMagentaToAdd;
    }

    public void setTonerMagentaToAdd(Integer tonerMagentaToAdd) {
        this.tonerMagentaToAdd = tonerMagentaToAdd;
    }

    public Integer getTonerYellowToAdd() {
        return tonerYellowToAdd;
    }

    public void setTonerYellowToAdd(Integer tonerYellowToAdd) {
        this.tonerYellowToAdd = tonerYellowToAdd;
    }
}
