package com.hackathon.carbon.dto.dpe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DpeDocumentDTO {
    private Long id;
    private Long siteId;
    private String filename;
    private String mimeType;
    private LocalDateTime uploadedAt;
    private String address;
    private Double surfaceM2;
    private Map<String, Object> analysis;
}

