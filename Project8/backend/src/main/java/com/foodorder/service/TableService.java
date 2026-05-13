package com.foodorder.service;

import com.foodorder.entity.TableEntity;
import com.foodorder.repository.TableRepository;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
public class TableService {
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    public List<TableEntity> getAllTables() {
        return tableRepository.findAll();
    }
    
    public TableEntity getTableById(Long id) {
        return tableRepository.findById(id).orElseThrow(() -> new RuntimeException("餐桌不存在"));
    }
    
    public TableEntity getTableByNo(String tableNo) {
        return tableRepository.findByTableNo(tableNo).orElseThrow(() -> new RuntimeException("餐桌不存在"));
    }
    
    @Transactional
    public TableEntity createTable(TableEntity table) throws WriterException, IOException {
        if (tableRepository.existsByTableNo(table.getTableNo())) {
            throw new RuntimeException("桌号已存在");
        }
        if (table.getSeats() == null) {
            table.setSeats(2);
        }
        table.setStatus("AVAILABLE");
        String qrcode = qrCodeService.generateQRCodeBase64(table.getTableNo(), 300, 300);
        table.setQrcode(qrcode);
        return tableRepository.save(table);
    }
    
    @Transactional
    public TableEntity regenerateQRCode(Long tableId) throws WriterException, IOException {
        TableEntity table = getTableById(tableId);
        String qrcode = qrCodeService.generateQRCodeBase64(table.getTableNo(), 300, 300);
        table.setQrcode(qrcode);
        return tableRepository.save(table);
    }
    
    @Transactional
    public TableEntity updateTableStatus(Long id, String status) {
        TableEntity table = getTableById(id);
        table.setStatus(status);
        return tableRepository.save(table);
    }
    
    @Transactional
    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }
}
