package com.netflix.clone.service;

import com.netflix.clone.dto.response.MessageResponse;
import com.netflix.clone.dto.response.PageResponse;
import com.netflix.clone.dto.response.VideoResponse;

public interface WatchlistService {
    MessageResponse addToWatchList(String email, Long videoId);

    MessageResponse removeFromWatchList(Long videoId, String email);

    PageResponse<VideoResponse> getWatchlistPaginated(String email, int page, int size, String search);
}
