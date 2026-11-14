package com.pmsvgroup.nativeapp

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class PmsvState(
    val news: List<NewsItem> = emptyList(), val saved: List<NewsItem> = emptyList(),
    val loading: Boolean = true, val error: String? = null, val updatedAt: Long = 0
)

class PmsvViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = PmsvRepository(application)
    private val mutable = MutableStateFlow(PmsvState())
    val state = mutable.asStateFlow()
    init {
        viewModelScope.launch {
            val initial = withContext(Dispatchers.IO) { PmsvState(repository.cached(), repository.saved(), true, updatedAt = repository.refreshedAt()) }
            mutable.value = initial
            refreshNow()
        }
    }
    fun refresh() { if (!mutable.value.loading) viewModelScope.launch { refreshNow() } }
    fun refreshIfStale() {
        if (System.currentTimeMillis() - mutable.value.updatedAt > 15 * 60_000L) refresh()
    }
    private suspend fun refreshNow() {
        mutable.update { it.copy(loading = true, error = null) }
        try {
            val items = withContext(Dispatchers.IO) { repository.refresh() }
            mutable.update { it.copy(news = items, loading = false, updatedAt = repository.refreshedAt()) }
        } catch (e: Exception) {
            mutable.update { it.copy(loading = false, error = "Could not refresh. Showing updates saved on this device. Please check your connection and try again.") }
        }
    }
    fun toggleSaved(item: NewsItem) {
        val old = mutable.value.saved
        val next = if (old.any { it.id == item.id }) old.filterNot { it.id == item.id } else listOf(item) + old
        repository.save(next)
        mutable.update { it.copy(saved = next) }
    }
}
