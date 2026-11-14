package com.pmsvgroup.nativeapp

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.OpenInNew
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import java.text.DateFormat
import java.util.Date

private val Teal = Color(0xFF075C58)
private val Navy = Color(0xFF172642)

@Composable fun PmsvTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (isSystemInDarkTheme()) darkColorScheme(primary = Color(0xFF83D5CB), secondary = Color(0xFFAAC7FF))
        else lightColorScheme(primary = Teal, secondary = Color(0xFF3155D9), background = Color(0xFFF4F7FA), surface = Color.White, onSurface = Navy), content = content)
}

private data class Destination(val id: String, val title: String, val icon: ImageVector)
private val destinations = listOf(
    Destination("home", "Home", Icons.Outlined.Home), Destination("updates", "Updates", Icons.Outlined.Newspaper),
    Destination("tools", "Tools", Icons.Outlined.FactCheck), Destination("saved", "Saved", Icons.Outlined.BookmarkBorder),
    Destination("settings", "Settings", Icons.Outlined.Settings))
private val filters = listOf("all" to "All", "fssai" to "FSSAI", "general" to "News", "certifications" to "Standards", "quality" to "Quality", "excellence" to "Excellence", "blogs" to "Blogs")

@OptIn(ExperimentalMaterial3Api::class)
@Composable fun PmsvApp(
    state: PmsvState, navigation: Pair<String, Long>, refresh: () -> Unit, toggleSaved: (NewsItem) -> Unit,
    openTool: (String, String) -> Unit, openSource: (NewsItem) -> Unit, share: (NewsItem) -> Unit,
    alertsEnabled: Boolean, alertsAllowed: Boolean, toggleAlerts: (Boolean) -> Unit,
    testAlert: () -> Boolean, openNotificationSettings: () -> Unit
) {
    var screen by rememberSaveable { mutableStateOf(navigation.first) }
    var articleId by rememberSaveable { mutableStateOf<String?>(null) }
    var filter by rememberSaveable { mutableStateOf("all") }
    var query by rememberSaveable { mutableStateOf("") }
    var alertMessage by rememberSaveable { mutableStateOf("") }
    var handledNavigation by rememberSaveable { mutableLongStateOf(Long.MIN_VALUE) }
    LaunchedEffect(navigation) {
        if (handledNavigation != navigation.second) {
            screen = navigation.first; articleId = null; handledNavigation = navigation.second
        }
    }
    val article = (state.news + state.saved).find { it.id == articleId }
    val savedIds = remember(state.saved) { state.saved.map { it.id }.toSet() }
    val chooseFilter: (String) -> Unit = { filter = it; query = ""; screen = "updates" }
    BackHandler(enabled = articleId != null || screen != "home") { if (articleId != null) articleId = null else screen = "home" }
    Scaffold(
        topBar = {
            TopAppBar(title = {
                if (articleId != null) Text("Update details", maxLines = 1)
                else Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Image(painterResource(R.drawable.pmsv_logo), "PMSV family logo", Modifier.size(38.dp))
                    Column { Text("PMSV", fontWeight = FontWeight.Bold); Text("Food Safety & Quality", style = MaterialTheme.typography.labelMedium) }
                }
            }, navigationIcon = { if (articleId != null) IconButton(onClick = { articleId = null }) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, "Back to updates") } },
                actions = { if (articleId == null && screen != "settings") IconButton(onClick = refresh, enabled = !state.loading) { Icon(Icons.Outlined.Refresh, "Refresh updates") } })
        },
        bottomBar = { if (articleId == null) NavigationBar { destinations.forEach { destination ->
            NavigationBarItem(selected = screen == destination.id, onClick = { screen = destination.id },
                icon = { Icon(destination.icon, destination.title) }, label = { Text(destination.title) })
        } } }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            if (state.loading) LinearProgressIndicator(Modifier.fillMaxWidth())
            if (article != null) ArticleDetail(article, article.id in savedIds, { toggleSaved(article) }, { openSource(article) }, { share(article) })
            else when (screen) {
                "home" -> LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    item {
                        Card(colors = CardDefaults.cardColors(containerColor = Teal), shape = RoundedCornerShape(24.dp)) {
                            Column(Modifier.fillMaxWidth().padding(22.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("YOUR FOOD SAFETY DESK", style = MaterialTheme.typography.labelMedium, color = Color(0xFFB1E4DD))
                                Text("Stay informed.\nWork with confidence.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Regulatory updates, practical tools and quality insights in one place.", color = Color(0xFFE2F2EF))
                                FilledTonalButton(onClick = { chooseFilter("fssai") }) { Text("Explore FSSAI updates") }
                            }
                        }
                    }
                    item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        QuickCard("Audit tools", "Checklists & reports", Icons.Outlined.FactCheck, Modifier.weight(1f)) { screen = "tools" }
                        QuickCard("Saved updates", "${state.saved.size} on this device", Icons.Outlined.BookmarkBorder, Modifier.weight(1f)) { screen = "saved" }
                    } }
                    if (state.error != null) item { StatusMessage(state.error, refresh) }
                    item { Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Text("Latest updates", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                        TextButton(onClick = { chooseFilter("all") }) { Text("View all") }
                    } }
                    if (!state.loading && state.news.isEmpty()) item { EmptyMessage("No updates loaded yet", "Connect to the internet and tap Refresh.") }
                    items(state.news.take(12), key = { it.id }) { item -> NewsCard(item, item.id in savedIds, { articleId = item.id }, { toggleSaved(item) }) }
                    item { Freshness(state.updatedAt) }
                }
                "updates", "saved" -> {
                    val savedScreen = screen == "saved"
                    val visible = remember(state.news, state.saved, filter, query, savedScreen) { filteredNews(if (savedScreen) state.saved else state.news, if (savedScreen) "all" else filter, query) }
                    Column(Modifier.padding(horizontal = 20.dp)) {
                        Text(if (savedScreen) "Your saved updates" else "Updates & insights", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                        OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth().padding(vertical = 12.dp), singleLine = true,
                            label = { Text("Search updates") }, leadingIcon = { Icon(Icons.Outlined.Search, null) },
                            trailingIcon = { if (query.isNotEmpty()) IconButton(onClick = { query = "" }) { Icon(Icons.Outlined.Close, "Clear search") } })
                        if (!savedScreen) Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            filters.forEach { (id, label) -> FilterChip(selected = filter == id, onClick = { filter = id }, label = { Text(label) }) }
                        }
                        Text(if (savedScreen) "Saved headlines and summaries stay available offline." else "${visible.size} updates · Publication dates shown", style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(vertical = 8.dp))
                    }
                    LazyColumn(contentPadding = PaddingValues(20.dp, 8.dp, 20.dp, 20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (state.error != null && !savedScreen) item { StatusMessage(state.error, refresh) }
                        if (visible.isEmpty() && !state.loading) item { EmptyMessage(if (savedScreen) "Nothing saved here yet" else "No matching updates", if (savedScreen) "Tap the bookmark on any update to keep its headline and summary." else "Try another search or category.") }
                        items(visible, key = { it.id }) { item -> NewsCard(item, item.id in savedIds, { articleId = item.id }, { toggleSaved(item) }) }
                        item { Freshness(state.updatedAt) }
                    }
                }
                "tools" -> LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    item { Text("Your workspace", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
                    item { Text("Practical resources for food safety, quality and process excellence.") }
                    item { ToolCard("Audits", "Inspection checklists, hygiene ratings and reports", Icons.Outlined.FactCheck) { openTool("PMSV audits", "https://pmsvgroup.com/audits/index.html") } }
                    item { ToolCard("FSSAI Licence", "Licence guidance and application checklists", Icons.Outlined.Description) { openTool("FSSAI Licence", "https://pmsvgroup.com/fssai-license") } }
                    item { ToolCard("Discussions", "Ask questions and learn from the community", Icons.Outlined.Forum) { openTool("PMSV discussions", "https://pmsvgroup.com/discussions") } }
                    item { ToolCard("Blogs", "Food safety and quality perspectives", Icons.Outlined.MenuBook) { chooseFilter("blogs") } }
                    item { Card { Text("Audit, licence and discussion forms use the existing PMSV web tools during this preview. Audits saved in your current app remain there. Continue using that app for existing audit records and report exports.", Modifier.padding(16.dp), style = MaterialTheme.typography.bodySmall) } }
                }
                "settings" -> LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    item { Text("Make PMSV yours", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
                    item { Card { Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) { Text("Daily update alerts", fontWeight = FontWeight.Bold); Text(if (alertsEnabled && alertsAllowed) "Enabled on this device" else "Off", style = MaterialTheme.typography.bodySmall) }
                            Switch(checked = alertsEnabled && alertsAllowed, onCheckedChange = toggleAlerts)
                        }
                        Text("This preview checks for updates about every 30 minutes. Android may delay checks to save battery. Instant push is planned for the release version.", style = MaterialTheme.typography.bodySmall)
                        OutlinedButton(onClick = { alertMessage = if (testAlert()) "Test posted. Check your notification shade and tap it to open Updates." else "Android has not allowed notifications. Open notification settings below." }, Modifier.fillMaxWidth()) { Text("Send native test notification") }
                        TextButton(onClick = openNotificationSettings) { Text("Android notification settings") }
                        if (alertMessage.isNotBlank()) Text(alertMessage, style = MaterialTheme.typography.bodySmall)
                    } } }
                    item { Card { Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Available offline", fontWeight = FontWeight.Bold)
                        Text("${state.news.size} cached updates · ${state.saved.size} saved summaries")
                        Freshness(state.updatedAt)
                        OutlinedButton(onClick = refresh, enabled = !state.loading) { Text("Refresh content") }
                    } } }
                    item { TextButton(onClick = { openTool("Privacy & support", "https://pmsvgroup.com/privacy") }) { Text("Privacy & support") } }
                    item { Text("PMSV Native Preview\nVersion ${BuildConfig.VERSION_NAME}\nYour current PMSV app remains installed separately.", style = MaterialTheme.typography.bodySmall) }
                }
            }
        }
    }
}

@Composable private fun QuickCard(title: String, subtitle: String, icon: ImageVector, modifier: Modifier, action: () -> Unit) {
    Card(onClick = action, modifier = modifier) { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(icon, null, tint = MaterialTheme.colorScheme.primary); Text(title, fontWeight = FontWeight.SemiBold); Text(subtitle, style = MaterialTheme.typography.bodySmall)
    } }
}
@Composable private fun ToolCard(title: String, description: String, icon: ImageVector, action: () -> Unit) {
    Card(onClick = action) { Row(Modifier.fillMaxWidth().padding(20.dp), horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(28.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) { Text(title, fontWeight = FontWeight.Bold); Text(description, style = MaterialTheme.typography.bodyMedium) }
        Icon(Icons.Outlined.ChevronRight, null)
    } }
}
@Composable private fun NewsCard(item: NewsItem, saved: Boolean, open: () -> Unit, save: () -> Unit) {
    Card(onClick = open, modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(item.source, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.labelLarge, modifier = Modifier.weight(1f), maxLines = 2, overflow = TextOverflow.Ellipsis)
            IconButton(onClick = save) { Icon(if (saved) Icons.Outlined.BookmarkAdded else Icons.Outlined.BookmarkBorder, if (saved) "Unsave ${item.title}" else "Save ${item.title}") }
        }
        Text(item.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, maxLines = 4, overflow = TextOverflow.Ellipsis)
        Text("${displayDate(item.published)} · ${item.category}", style = MaterialTheme.typography.bodySmall)
    } }
}
@Composable private fun ArticleDetail(item: NewsItem, saved: Boolean, save: () -> Unit, source: () -> Unit, share: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Text(item.source.uppercase(), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge)
        Text(item.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text("Published ${displayDate(item.published)}\n${item.category}", style = MaterialTheme.typography.bodyMedium)
        HorizontalDivider()
        Text(item.summary.ifBlank { "Open the source for the full article or official document." }, style = MaterialTheme.typography.bodyLarge)
        Button(onClick = source, modifier = Modifier.fillMaxWidth()) { Icon(Icons.AutoMirrored.Outlined.OpenInNew, null); Spacer(Modifier.width(8.dp)); Text("Read original source") }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = save, modifier = Modifier.weight(1f)) { Text(if (saved) "Saved" else "Save update") }
            OutlinedButton(onClick = share, modifier = Modifier.weight(1f)) { Icon(Icons.Outlined.Share, null); Spacer(Modifier.width(6.dp)); Text("Share") }
        }
        Text("Publication date is not an effective date. Refer to the original document for applicability and implementation dates.", style = MaterialTheme.typography.bodySmall)
    }
}
@Composable private fun StatusMessage(message: String, retry: () -> Unit) { Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
    Column(Modifier.padding(16.dp)) { Text(message, style = MaterialTheme.typography.bodyMedium); TextButton(onClick = retry) { Text("Retry") } }
} }
@Composable private fun EmptyMessage(title: String, body: String) { Column(Modifier.fillMaxWidth().padding(vertical = 24.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
    Text(title, style = MaterialTheme.typography.titleMedium); Text(body, style = MaterialTheme.typography.bodyMedium)
} }
@Composable private fun Freshness(timestamp: Long) { Text(if (timestamp == 0L) "Content refreshes when you connect." else "Last synced ${DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(timestamp))}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
