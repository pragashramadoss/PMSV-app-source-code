package com.pmsvgroup.nativeapp

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.DateFormat
import java.time.LocalDate
import java.time.ZoneId
import java.util.Date

// Match the website's light palette, compact cards and navigation.
private val Teal = Color(0xFF075C58)
private val Navy = Color(0xFF192642)
private val Blue = Color(0xFF3155D9)
private val Muted = Color(0xFF647591)
private val Line = Color(0xFFE2E7F0)
private val Page = Color(0xFFF5F7FA)
private val CardShape = RoundedCornerShape(12.dp)
private val ButtonShape = RoundedCornerShape(8.dp)

@Composable fun PmsvTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = lightColorScheme(primary = Teal, onPrimary = Color.White,
        secondary = Blue, background = Page, surface = Color.White, surfaceVariant = Page,
        onSurface = Navy, onBackground = Navy, onSurfaceVariant = Muted, outline = Line,
        secondaryContainer = Color(0xFFEDF2FF)), content = content)
}
private data class Destination(val id: String, val title: String, val icon: ImageVector, val tint: Color = Blue)
private val destinations = listOf(
    Destination("updates", "Updates/News", Icons.Outlined.Newspaper, Color(0xFF087881)),
    Destination("audits", "Audits", Icons.Outlined.VerifiedUser, Color(0xFF136C48)),
    Destination("licence", "FSSAI Licence", Icons.Outlined.Description),
    Destination("blogs", "Blogs", Icons.Outlined.MenuBook, Color(0xFF7655A4)),
    Destination("discussions", "Discussions", Icons.Outlined.Forum, Color(0xFFB34265)))
private val topics = listOf(
    Destination("regulatory", "Regulatory", Icons.Outlined.VerifiedUser),
    Destination("general", "Food safety news", Icons.Outlined.Newspaper, Color(0xFF087881)),
    Destination("quality", "Quality", Icons.Outlined.Verified),
    Destination("excellence", "Process excellence", Icons.Outlined.TrendingUp, Color(0xFF136C48)),
    Destination("certifications", "Certifications", Icons.Outlined.WorkspacePremium, Color(0xFF7655A4)))
private val regions = listOf("india" to "India · FSSAI", "us" to "United States · US FDA",
    "eu" to "European Union · EC / EFSA", "uk" to "United Kingdom · FSA", "australia" to "Australia · FSANZ")
private val filters = listOf("all" to "All", "fssai" to "Regulatory", "general" to "Food safety news",
    "quality" to "Quality", "excellence" to "Excellence", "certifications" to "Certifications")

@Composable fun PmsvApp(
    state: PmsvState, navigation: Pair<String, Long>, refresh: () -> Unit, toggleSaved: (NewsItem) -> Unit,
    openTool: (String, String) -> Unit, openSource: (NewsItem) -> Unit, share: (NewsItem) -> Unit,
    alertsEnabled: Boolean, alertsAllowed: Boolean, toggleAlerts: (Boolean) -> Unit,
    testAlert: () -> Boolean, openNotificationSettings: () -> Unit
) {
    var screen by rememberSaveable { mutableStateOf(navigation.first) }
    var articleId by rememberSaveable { mutableStateOf<String?>(null) }
    var filter by rememberSaveable { mutableStateOf("all") }
    var region by rememberSaveable { mutableStateOf("all") }
    var query by rememberSaveable { mutableStateOf("") }
    var notifications by rememberSaveable { mutableStateOf(false) }
    var alertMessage by rememberSaveable { mutableStateOf("") }
    var handledNavigation by rememberSaveable { mutableLongStateOf(Long.MIN_VALUE) }
    LaunchedEffect(navigation) {
        if (handledNavigation != navigation.second) {
            screen = navigation.first; articleId = null; filter = "all"; region = "all"; query = ""
            notifications = false; handledNavigation = navigation.second
        }
    }
    val article = (state.news + state.saved).find { it.id == articleId }
    val savedIds = remember(state.saved) { state.saved.map { it.id }.toSet() }
    val go: (String) -> Unit = { target ->
        when (target) {
            "audits" -> openTool("Audits", "https://pmsvgroup.com/audits/index.html")
            "licence" -> openTool("FSSAI Licence", "https://pmsvgroup.com/fssai-license")
            "discussions" -> openTool("Discussions", "https://pmsvgroup.com/discussions")
            else -> { screen = target; articleId = null; query = ""; filter = "all"; region = "all" }
        }
    }
    val back: () -> Unit = {
        if (articleId != null) articleId = null
        else if (screen == "feed") go(if (filter == "fssai") "regulatory" else "updates")
        else if (screen == "regulatory") go("updates") else go("home")
    }
    BackHandler(enabled = articleId != null || screen != "home", onBack = back)
    Scaffold(containerColor = Page, topBar = {
        PmsvHeader(alertsEnabled, alertsAllowed, onHome = { go("home") },
            onNotifications = { notifications = true }, onSaved = { go("saved") },
            onSettings = { go("settings") }, onRefresh = refresh, refreshEnabled = !state.loading)
    }, bottomBar = { PmsvNavigation(screen, go) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            if (state.loading) LinearProgressIndicator(Modifier.fillMaxWidth(), color = Blue)
            if (article != null) {
                Breadcrumb("Update details", back, "Back to updates")
                ArticleDetail(article, article.id in savedIds, { toggleSaved(article) }, { openSource(article) }, { share(article) })
            } else if (screen == "settings") {
                Breadcrumb("Settings", back)
                LazyColumn(contentPadding = PaddingValues(18.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    item { PageTitle("Settings") }
                    item { WhiteCard { NotificationControls(alertsEnabled, alertsAllowed, toggleAlerts, testAlert, openNotificationSettings, alertMessage, { alertMessage = it }) } }
                    item { WhiteCard {
                        Text("Available offline", fontWeight = FontWeight.Bold)
                        Text("${state.news.size} cached updates · ${state.saved.size} saved summaries")
                        Freshness(state.updatedAt)
                        OutlinedButton(onClick = refresh, enabled = !state.loading, shape = ButtonShape) { Text("Refresh content") }
                    } }
                    item { Text("Saved audit drafts stay inside this app on this phone. Reopen them through Audits → Saved Audits. Account backup is not connected; uninstalling or clearing app data can erase them.", color = Muted, style = MaterialTheme.typography.bodyMedium) }
                    item { TextButton(onClick = { openTool("Privacy & support", "https://pmsvgroup.com/privacy") }) { Text("Privacy & support") } }
                    item { Text("PMSV Preview · ${BuildConfig.VERSION_NAME}", color = Muted, style = MaterialTheme.typography.bodySmall) }
                }
            } else {
                val home = screen == "home"
                val saved = screen == "saved"
                val blogs = screen == "blogs"
                val heading = when (screen) {
                    "home" -> "Welcome to the Forum"
                    "updates" -> "Updates/News"
                    "regulatory" -> "Regulatory updates"
                    "blogs" -> "Blogs"
                    "saved" -> "Saved updates"
                    else -> if (filter == "fssai" && region != "all") regions.firstOrNull { it.first == region }?.second ?: "Regulatory updates"
                        else filters.firstOrNull { it.first == filter }?.second ?: "Latest updates"
                }
                val visible = remember(state.news, state.saved, screen, filter, region, query) {
                    filteredNews(if (saved) state.saved else state.news,
                        if (blogs) "blogs" else if (screen == "regulatory") "fssai" else if (screen == "feed") filter else "all", query)
                        .filter { region == "all" || it.region.ifBlank { "india" } == region }
                }
                val recent = (home || screen == "updates" || screen == "regulatory") && query.isBlank()
                key(screen, region) {
                LazyColumn(contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 20.dp, bottom = 24.dp)) {
                    if (!home) item { Breadcrumb(heading, back, modifier = Modifier.padding(bottom = 14.dp), inset = false) }
                    item {
                        PageTitle(heading)
                        val intro = when (screen) {
                            "home" -> "Learn, share and stay updated on food safety, quality and process excellence."
                            "updates" -> "Regulatory, food safety, quality, process excellence, certification and blog updates in one place."
                            "regulatory" -> "Choose a country or region to explore official updates."
                            "saved" -> "Saved headlines and summaries stay available offline on this phone."
                            else -> ""
                        }
                        if (intro.isNotBlank()) Text(intro, color = Muted, fontSize = 14.sp, lineHeight = 21.sp, modifier = Modifier.padding(top = 8.dp))
                        Spacer(Modifier.height(18.dp))
                        SearchBox(query, { query = it }, home || screen == "updates")
                        Spacer(Modifier.height(16.dp))
                    }
                    if (query.isBlank()) {
                        if (home) item { Launcher(destinations, go); Spacer(Modifier.height(24.dp)) }
                        if (screen == "updates") item {
                            Launcher(topics) { target ->
                                region = "all"
                                if (target == "regulatory") screen = "regulatory" else { filter = target; screen = "feed" }
                            }
                            Spacer(Modifier.height(24.dp))
                        }
                        if (screen == "regulatory") item {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                regions.forEach { (id, name) ->
                                    OutlinedCard(onClick = { region = id; filter = "fssai"; screen = "feed" }, colors = CardDefaults.outlinedCardColors(containerColor = Color.White), border = BorderStroke(1.dp, Line), shape = CardShape) {
                                        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Outlined.Language, null, tint = Blue)
                                            Text(name, modifier = Modifier.weight(1f).padding(horizontal = 12.dp), fontWeight = FontWeight.SemiBold)
                                            Icon(Icons.Outlined.ChevronRight, null, tint = Blue)
                                        }
                                    }
                                }
                            }
                            Spacer(Modifier.height(24.dp))
                        }
                    }
                    if (screen == "feed") item {
                        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            filters.forEach { (id, label) -> FilterChip(selected = filter == id, onClick = { filter = id; region = "all" }, label = { Text(label) }, shape = ButtonShape) }
                        }
                        Spacer(Modifier.height(12.dp))
                    }
                    if (state.error != null && !saved) item { StatusMessage(state.error, refresh); Spacer(Modifier.height(14.dp)) }
                    item {
                        Row(Modifier.fillMaxWidth().padding(bottom = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(if (query.isNotBlank()) "Search results" else if (recent) "Latest updates" else if (saved) "On this device" else "Latest stories",
                                fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            if (recent) Text("All sections".takeIf { home || screen == "updates" } ?: "Regulatory", fontSize = 11.sp, color = Muted)
                            else Text("${visible.size} ${if (visible.size == 1) "item" else "items"}", fontSize = 12.sp, color = Muted)
                        }
                    }
                    if (visible.isEmpty() && !state.loading) item {
                        EmptyMessage(if (saved) "Nothing saved here yet" else "No matching updates",
                            if (saved) "Open an update and tap Save update to keep its headline and summary." else "Try another keyword or refresh the content.")
                    }
                    if (recent) {
                        val latest = visible.take(12)
                        itemsIndexed(latest, key = { _, item -> item.id }) { index, item -> RecentUpdateRow(item, index == 0, index == latest.lastIndex) { articleId = item.id } }
                        if (visible.size > 12) item {
                            OutlinedButton(onClick = { if (home) go("updates") else { filter = if (screen == "regulatory") "fssai" else "all"; screen = "feed" } }, modifier = Modifier.fillMaxWidth().padding(top = 16.dp), shape = ButtonShape) { Text("View all updates") }
                        }
                    } else items(visible, key = { it.id }) { item ->
                        NewsCard(item, item.id in savedIds, { articleId = item.id }, { toggleSaved(item) })
                        Spacer(Modifier.height(12.dp))
                    }
                    item { Spacer(Modifier.height(22.dp)); Freshness(state.updatedAt) }
                }
                }
            }
        }
    }
    if (notifications) PmsvNotificationDialog(alertsEnabled, alertsAllowed, toggleAlerts, testAlert,
        openNotificationSettings, onDismiss = { notifications = false })
}

/** One masthead and tab bar for both native screens and embedded tools. */
@Composable internal fun PmsvHeader(
    alertsEnabled: Boolean, alertsAllowed: Boolean, onHome: () -> Unit,
    onNotifications: () -> Unit, onSaved: () -> Unit, onSettings: () -> Unit,
    onRefresh: () -> Unit, refreshEnabled: Boolean = true, refreshLabel: String = "Refresh updates"
) {
    var menu by remember { mutableStateOf(false) }
    Surface(color = Color.White) {
        Column(Modifier.testTag("pmsv-header").statusBarsPadding()) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                Row(Modifier.weight(1f).clickable(onClick = onHome).semantics { contentDescription = "PMSV home" },
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Image(painterResource(R.drawable.pmsv_logo), null, Modifier.size(46.dp))
                    Column {
                        Text("PMSV", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
                        Text("Food Safety & Quality Forum", fontSize = 11.sp, lineHeight = 15.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
                OutlinedIconButton(onClick = onNotifications, modifier = Modifier.size(42.dp), shape = RoundedCornerShape(12.dp), border = BorderStroke(1.dp, Line),
                    colors = IconButtonDefaults.outlinedIconButtonColors(containerColor = Color(0xFFF1F5FF), contentColor = Blue)) {
                    Icon(if (alertsEnabled && alertsAllowed) Icons.Outlined.NotificationsActive else Icons.Outlined.NotificationsNone, "App notifications")
                }
                Box {
                    IconButton(onClick = { menu = true }, modifier = Modifier.width(36.dp)) { Icon(Icons.Outlined.MoreVert, "More options", tint = Muted) }
                    DropdownMenu(expanded = menu, onDismissRequest = { menu = false }, containerColor = Color.White) {
                        DropdownMenuItem(text = { Text("Saved updates") }, leadingIcon = { Icon(Icons.Outlined.BookmarkBorder, null) }, onClick = { menu = false; onSaved() })
                        DropdownMenuItem(text = { Text(refreshLabel) }, leadingIcon = { Icon(Icons.Outlined.Refresh, null) }, onClick = { menu = false; onRefresh() }, enabled = refreshEnabled)
                        DropdownMenuItem(text = { Text("Settings") }, leadingIcon = { Icon(Icons.Outlined.Settings, null) }, onClick = { menu = false; onSettings() })
                    }
                }
            }
            HorizontalDivider(color = Line)
        }
    }
}

@Composable internal fun PmsvNotificationDialog(
    enabled: Boolean, allowed: Boolean, toggle: (Boolean) -> Unit, test: () -> Boolean,
    settings: () -> Unit, onDismiss: () -> Unit
) {
    var message by rememberSaveable { mutableStateOf("") }
    AlertDialog(onDismissRequest = onDismiss, containerColor = Color.White, shape = RoundedCornerShape(14.dp),
        title = { Row(verticalAlignment = Alignment.CenterVertically) {
            Text("App notifications", fontWeight = FontWeight.Bold, fontSize = 22.sp, modifier = Modifier.weight(1f))
            IconButton(onClick = onDismiss) { Icon(Icons.Outlined.Close, "Close notifications") }
        } }, text = { Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Turn on alerts for new PMSV updates.", color = Muted)
            NotificationControls(enabled, allowed, toggle, test, settings, message, { message = it })
        } }, confirmButton = {})
}

@Composable internal fun PmsvNavigation(screen: String, go: (String) -> Unit) {
    Surface(color = Color.White) {
        Column(Modifier.testTag("pmsv-navigation").navigationBarsPadding()) {
            HorizontalDivider(color = Line)
            Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 7.dp), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                destinations.forEach { destination ->
                    val selected = screen == destination.id || (destination.id == "updates" && screen in listOf("feed", "regulatory"))
                    Column(Modifier.weight(1f).background(if (selected) Color(0xFFEDF2FF) else Color.Transparent, RoundedCornerShape(10.dp))
                        .selectable(selected = selected, role = Role.Tab, onClick = { go(destination.id) })
                        .semantics { contentDescription = "Navigate to ${destination.title}" }
                        .heightIn(min = 56.dp).padding(horizontal = 1.dp, vertical = 7.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(destination.icon, null, tint = if (selected) Blue else Color(0xFF8591A6), modifier = Modifier.size(21.dp))
                        Text(destination.title, fontSize = 10.sp, lineHeight = 12.sp, fontWeight = FontWeight.Bold, color = if (selected) Blue else Color(0xFF8591A6), textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}
@Composable private fun PageTitle(text: String) { Text(text, fontSize = 27.sp, lineHeight = 33.sp, letterSpacing = (-0.6).sp, fontWeight = FontWeight.ExtraBold) }
@Composable private fun Breadcrumb(title: String, back: () -> Unit, description: String = "Back", modifier: Modifier = Modifier, inset: Boolean = true) {
    Row(modifier.then(if (inset) Modifier.padding(horizontal = 18.dp, vertical = 6.dp) else Modifier), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = back, modifier = Modifier.size(36.dp)) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, description, tint = Blue, modifier = Modifier.size(20.dp)) }
        Text(title, style = MaterialTheme.typography.bodySmall, color = Muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}
@Composable private fun SearchBox(value: String, update: (String) -> Unit, global: Boolean) {
    OutlinedTextField(value, update, modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Search news updates" }, singleLine = true,
        placeholder = { Text(if (global) "Search all topics, countries, regulators and news…" else "Search this feed by topic, organisation or date…", fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        leadingIcon = { Icon(Icons.Outlined.Search, null, tint = Muted) },
        trailingIcon = { if (value.isNotEmpty()) IconButton(onClick = { update("") }) { Icon(Icons.Outlined.Close, "Clear search") } },
        shape = CardShape, colors = OutlinedTextFieldDefaults.colors(unfocusedContainerColor = Color.White, focusedContainerColor = Color.White, unfocusedBorderColor = Line, focusedBorderColor = Teal))
}
@Composable private fun Launcher(entries: List<Destination>, select: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        entries.chunked(3).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { entry ->
                    OutlinedCard(onClick = { select(entry.id) }, modifier = Modifier.weight(1f).heightIn(min = 86.dp), shape = CardShape,
                        colors = CardDefaults.outlinedCardColors(containerColor = Color.White), border = BorderStroke(1.dp, Line)) {
                        Column(Modifier.padding(11.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(entry.icon, null, tint = entry.tint, modifier = Modifier.size(23.dp))
                            Text(entry.title, fontSize = 13.sp, lineHeight = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}
@Composable private fun RecentUpdateRow(item: NewsItem, first: Boolean, last: Boolean, open: () -> Unit) {
    Surface(onClick = open, color = Color.White, border = BorderStroke(0.5.dp, Line),
        shape = RoundedCornerShape(topStart = if (first) 12.dp else 0.dp, topEnd = if (first) 12.dp else 0.dp,
            bottomStart = if (last) 12.dp else 0.dp, bottomEnd = if (last) 12.dp else 0.dp)) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                val today = LocalDate.now(ZoneId.of("Asia/Kolkata")).toString()
                Text("${item.source} · ${displayDate(item.published)}${if (item.published == today) " · Today" else ""}", color = Muted, fontSize = 12.sp, lineHeight = 17.sp)
                Text(item.title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 21.sp, maxLines = 3, overflow = TextOverflow.Ellipsis)
            }
            Icon(Icons.Outlined.NorthEast, null, tint = Blue, modifier = Modifier.size(21.dp))
        }
    }
}
@Composable private fun NewsCard(item: NewsItem, saved: Boolean, open: () -> Unit, save: () -> Unit) {
    OutlinedCard(onClick = open, modifier = Modifier.fillMaxWidth(), shape = CardShape,
        colors = CardDefaults.outlinedCardColors(containerColor = Color.White), border = BorderStroke(1.dp, Line)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(item.category, color = Teal, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f).padding(end = 8.dp))
                Text(displayDate(item.published), color = Muted, fontSize = 11.sp)
            }
            Text(item.title, fontSize = 18.sp, lineHeight = 25.sp, fontWeight = FontWeight.Bold)
            if (item.summary.isNotBlank() && item.summary != item.title) Text(item.summary, color = Muted, fontSize = 14.sp, lineHeight = 21.sp, maxLines = 4, overflow = TextOverflow.Ellipsis)
            HorizontalDivider(color = Line)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(item.source, modifier = Modifier.weight(1f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                IconButton(onClick = save) { Icon(if (saved) Icons.Outlined.BookmarkAdded else Icons.Outlined.BookmarkBorder, if (saved) "Unsave ${item.title}" else "Save ${item.title}", tint = Blue) }
                Icon(Icons.Outlined.NorthEast, null, tint = Blue, modifier = Modifier.size(20.dp))
            }
        }
    }
}
@Composable private fun ArticleDetail(item: NewsItem, saved: Boolean, save: () -> Unit, source: () -> Unit, share: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Text(item.source.uppercase(), color = Blue, style = MaterialTheme.typography.labelLarge)
        PageTitle(item.title)
        Text("Published ${displayDate(item.published)}\n${item.category}", color = Muted, style = MaterialTheme.typography.bodyMedium)
        HorizontalDivider(color = Line)
        Text(item.summary.ifBlank { "Open the source for the full article or official document." }, style = MaterialTheme.typography.bodyLarge)
        Button(onClick = source, modifier = Modifier.fillMaxWidth(), shape = ButtonShape) { Icon(Icons.AutoMirrored.Outlined.OpenInNew, null); Spacer(Modifier.width(8.dp)); Text("Read original source") }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = save, modifier = Modifier.weight(1f), shape = ButtonShape) { Text(if (saved) "Saved" else "Save update") }
            OutlinedButton(onClick = share, modifier = Modifier.weight(1f), shape = ButtonShape) { Icon(Icons.Outlined.Share, null); Spacer(Modifier.width(6.dp)); Text("Share") }
        }
        Text("Publication date is not an effective date. Refer to the original document for applicability and implementation dates.", color = Muted, style = MaterialTheme.typography.bodySmall)
    }
}
@Composable private fun NotificationControls(enabled: Boolean, allowed: Boolean, toggle: (Boolean) -> Unit, test: () -> Boolean, settings: () -> Unit, message: String, setMessage: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Daily update alerts", fontWeight = FontWeight.Bold)
        Text(if (enabled && allowed) "Enabled on this device" else "Alerts are off", color = Muted, style = MaterialTheme.typography.bodyMedium)
        Button(onClick = { toggle(!(enabled && allowed)) }, modifier = Modifier.fillMaxWidth(), shape = ButtonShape) { Text(if (enabled && allowed) "Turn off notifications" else "Allow notifications") }
        OutlinedButton(onClick = { setMessage(if (test()) "Test posted. Check your notification shade and tap it to open Updates." else "Android has not allowed notifications. Open notification settings below.") }, modifier = Modifier.fillMaxWidth(), shape = ButtonShape) { Text("Send test notification") }
        if (message.isNotBlank()) Text(message, style = MaterialTheme.typography.bodyMedium)
        TextButton(onClick = settings) { Text("Android notification settings") }
        Text("The app checks for daily updates about every 30 minutes. Android may delay checks to save battery.", color = Muted, style = MaterialTheme.typography.bodySmall)
    }
}
@Composable private fun WhiteCard(content: @Composable ColumnScope.() -> Unit) {
    OutlinedCard(shape = CardShape, colors = CardDefaults.outlinedCardColors(containerColor = Color.White), border = BorderStroke(1.dp, Line)) {
        Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
    }
}
@Composable private fun StatusMessage(message: String, retry: () -> Unit) { WhiteCard { Text(message); TextButton(onClick = retry) { Text("Retry") } } }
@Composable private fun EmptyMessage(title: String, body: String) { WhiteCard { Text(title, fontWeight = FontWeight.Bold); Text(body, color = Muted) } }
@Composable private fun Freshness(timestamp: Long) { Text(if (timestamp == 0L) "Content refreshes when you connect." else "Last synced ${DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(timestamp))}", style = MaterialTheme.typography.bodySmall, color = Muted) }
