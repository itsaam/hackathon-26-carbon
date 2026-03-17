package com.hackathon.carbon.dto;

import lombok.Data;

import java.util.List;

@Data
public class SiteAccessUpdateRequestDTO {
    private List<Long> siteIds;
}

