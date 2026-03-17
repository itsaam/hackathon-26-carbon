package com.hackathon.carbon.dto;

import lombok.Data;

import java.util.List;

@Data
public class SiteUserAccessUpdateRequestDTO {
    private List<Long> userIds;
}

