package com.pmsvgroup.nativeapp

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.DateFormat
import java.time.LocalDate
import java.time.ZoneId
import java.util.Date
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

// Match the website's light palette, compact cards and navigation.
private val Teal = Color(0xFF075C58)
private val Navy = Color(0xFF18243E)
private val Blue = Color(0xFF3155D9)
private val Muted = Color(0xFF728099)
private val Line = Color(0xFFE2E7F0)
private val Page = Color(0xFFF0F3F9)
private val CardShape = RoundedCornerShape(12.dp)
private val ButtonShape = RoundedCornerShape(8.dp)

@Composable fun PmsvTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = lightColorScheme(primary = Teal, onPrimary = Color.White,
        secondary = Blue, background = Page, surface = Color.White, surfaceVariant = Page,
        onSurface = Navy, onBackground = Navy, onSurfaceVariant = Muted, outline = Line,
        secondaryContainer = Color(0xFFEDF2FF)), typography = Typography(
        // Website text has no Material default tracking. Keep Android font scaling.
        bodyLarge = TextStyle(fontSize = 15.sp, lineHeight = 23.sp, letterSpacing = 0.sp),
        bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 21.sp, letterSpacing = 0.sp),
        bodySmall = TextStyle(fontSize = 12.sp, lineHeight = 18.sp, letterSpacing = 0.sp),
        labelLarge = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = 0.sp, fontWeight = FontWeight.SemiBold),
        labelMedium = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.sp, fontWeight = FontWeight.SemiBold),
        labelSmall = TextStyle(fontSize = 11.sp, lineHeight = 14.sp, letterSpacing = 0.sp),
        titleLarge = TextStyle(fontSize = 23.sp, lineHeight = 29.sp, letterSpacing = (-0.5).sp, fontWeight = FontWeight.Bold),
        titleMedium = TextStyle(fontSize = 17.sp, lineHeight = 23.sp, letterSpacing = 0.sp, fontWeight = FontWeight.SemiBold),
        titleSmall = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = 0.sp, fontWeight = FontWeight.SemiBold)
    ), content = { ProvideTextStyle(MaterialTheme.typography.bodyMedium, content = content) })
}
private data class Destination(val id: String, val title: String, val icon: ImageVector, val tint: Color = Blue)
private val destinations = listOf(
    Destination("updates", "Updates/News", PmsvIcons.News, Color(0xFF087881)),
    Destination("audits", "Audits", PmsvIcons.Shield, Color(0xFF136C48)),
    Destination("licence", "FSSAI Licence", PmsvIcons.File),
    Destination("blogs", "Blogs", PmsvIcons.Book, Color(0xFFB34265)),
    Destination("discussions", "Discussions", PmsvIcons.Messages))
private val topics = listOf(
    Destination("regulatory", "Regulatory", PmsvIcons.Shield),
    Destination("general", "Food safety news", PmsvIcons.News, Color(0xFF087881)),
    Destination("quality", "Quality", PmsvIcons.Badge, Color(0xFF985613)),
    Destination("excellence", "Process excellence", PmsvIcons.Trend, Color(0xFF136C48)),
    Destination("certifications", "Certifications", PmsvIcons.Award, Color(0xFF7655A4)))
private val regions = listOf("india" to "India · FSSAI", "us" to "United States · US FDA",
    "eu" to "European Union · EC / EFSA", "uk" to "United Kingdom · FSA", "australia" to "Australia · FSANZ")
private val regionLogos = mapOf("india" to R.drawable.regulator_india, "us" to R.drawable.regulator_us,
    "eu" to R.drawable.regulator_eu, "uk" to R.drawable.regulator_uk, "australia" to R.drawable.regulator_australia)
private val filters = listOf("all" to "All", "fssai" to "Regulatory", "general" to "Food safety news",
    "quality" to "Quality", "excellence" to "Excellence", "certifications" to "Certifications")

@Composable fun PmsvApp(
    state: PmsvState, navigation: Pair<String, Long>, refresh: () -> Unit, toggleSaved: (NewsItem) -> Unit,
    openTool: (String, String) -> Unit, openSource: (NewsItem) -> Unit, share: (NewsItem) -> Unit,
    alertsEnabled: Boolean, alertsAllowed: Boolean, toggleAlerts: (Boolean) -> Unit,
    testAlert: suspend () -> NewsAlertResult, openNotificationSettings: () -> Unit
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
                        Text("Audit checklists and the licence helper are included in the app and work offline.")
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
                LazyColumn(contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 18.dp, bottom = 24.dp)) {
                    if (!home) item { Breadcrumb(heading, back, modifier = Modifier.padding(bottom = 8.dp), inset = false) }
                    item {
                        PageTitle(heading)
                        val intro = when (screen) {
                            "home" -> "Learn, share and stay updated on food safety, quality and process excellence."
                            "updates" -> "Regulatory, food safety, quality, process excellence, certification and blog updates in one place."
                            "regulatory" -> "Choose a country or region to explore official updates."
                            "saved" -> "Saved headlines and summaries stay available offline on this phone."
                            else -> ""
                        }
                        if (intro.isNotBlank()) Text(intro, color = Muted, fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 4.dp))
                        Spacer(Modifier.height(12.dp))
                        SearchBox(query, { query = it }, home || screen == "updates")
                        Spacer(Modifier.height(16.dp))
                    }
                    if (query.isBlank()) {
                        if (home) item { HomeLauncher(destinations.take(3), go); Spacer(Modifier.height(18.dp)) }
                        if (screen == "updates") item {
                            TopicLauncher(topics) { target ->
                                region = "all"
                                if (target == "regulatory") screen = "regulatory" else { filter = target; screen = "feed" }
                            }
                            Spacer(Modifier.height(18.dp))
                        }
                        if (screen == "regulatory") item {
                            RegionLauncher { id -> region = id; filter = "fssai"; screen = "feed" }
                            Spacer(Modifier.height(18.dp))
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
                        Row(Modifier.fillMaxWidth().padding(bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(if (query.isNotBlank()) "Search results" else if (recent) "Latest updates" else if (saved) "On this device" else "Latest stories",
                                fontSize = 17.sp, lineHeight = 23.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                            if (recent) Text("All sections".takeIf { home || screen == "updates" } ?: "Regulatory", fontSize = 12.sp, color = Muted)
                            else Text("${visible.size} ${if (visible.size == 1) "item" else "items"}", fontSize = 12.sp, color = Muted)
                        }
                    }
                    if (visible.isEmpty() && !state.loading) item {
                        EmptyMessage(if (saved) "Nothing saved here yet" else "No matching updates",
                            if (saved) "Open an update and tap Save update to keep its headline and summary." else "Try another keyword or refresh the content.")
                    }
                    if (recent) {
                        val latest = visible.take(5)
                        itemsIndexed(latest, key = { _, item -> item.id }) { index, item -> RecentUpdateRow(item, index == 0, index == latest.lastIndex) { articleId = item.id } }
                        if (visible.size > 5) item {
                            TextButton(onClick = { filter = if (screen == "regulatory") "fssai" else "all"; screen = "feed" }, modifier = Modifier.fillMaxWidth().padding(top = 6.dp), shape = ButtonShape) { Text("View all updates", color = Blue) }
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
            Row(Modifier.fillMaxWidth().heightIn(min = 78.dp).padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                Row(Modifier.weight(1f).clickable(onClick = onHome).semantics { contentDescription = "PMSV home" },
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                    Image(painterResource(R.drawable.pmsv_logo), null, Modifier.size(50.dp))
                    Column(Modifier.weight(1f).padding(end = 4.dp)) {
                        Text("PMSV", fontSize = 19.sp, lineHeight = 23.sp, letterSpacing = (-0.5).sp, fontWeight = FontWeight.ExtraBold)
                        Text("Food Safety & Quality Forum", fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight.Medium)
                    }
                }
                OutlinedIconButton(onClick = onNotifications, modifier = Modifier.size(40.dp), shape = RoundedCornerShape(10.dp), border = BorderStroke(1.dp, Color(0xFFDCE4F7)),
                    colors = IconButtonDefaults.outlinedIconButtonColors(containerColor = Color(0xFFF1F5FF), contentColor = Blue)) {
                    Icon(if (alertsEnabled && alertsAllowed) PmsvIcons.BellRing else PmsvIcons.Bell, "App notifications", modifier = Modifier.size(20.dp))
                }
                Box {
                    IconButton(onClick = { menu = true }, modifier = Modifier.width(32.dp)) { Icon(Icons.Outlined.MoreVert, "More options", tint = Muted, modifier = Modifier.size(19.dp)) }
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
    enabled: Boolean, allowed: Boolean, toggle: (Boolean) -> Unit, test: suspend () -> NewsAlertResult,
    settings: () -> Unit, onDismiss: () -> Unit
) {
    var message by rememberSaveable { mutableStateOf("") }
    AlertDialog(onDismissRequest = onDismiss, containerColor = Color.White, shape = RoundedCornerShape(14.dp),
        title = { Row(verticalAlignment = Alignment.CenterVertically) {
            Text("App notifications", fontWeight = FontWeight.Bold, fontSize = 21.sp, lineHeight = 27.sp, modifier = Modifier.weight(1f))
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
            Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min).padding(horizontal = 4.dp, vertical = 7.dp), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                destinations.forEach { destination ->
                    val selected = screen == destination.id || (destination.id == "updates" && screen in listOf("feed", "regulatory"))
                    Column(Modifier.weight(1f).background(if (selected) Color(0xFFEDF2FF) else Color.Transparent, RoundedCornerShape(10.dp))
                        .selectable(selected = selected, role = Role.Tab, onClick = { go(destination.id) })
                        .semantics { contentDescription = "Navigate to ${destination.title}" }
                        .fillMaxHeight().heightIn(min = 60.dp).padding(horizontal = 1.dp, vertical = 7.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(3.dp, Alignment.CenterVertically)) {
                        Icon(destination.icon, null, tint = if (selected) Blue else Color(0xFF8591A6), modifier = Modifier.size(20.dp))
                        Text(destination.title, fontSize = 11.sp, lineHeight = 14.sp, fontWeight = FontWeight.Bold, color = if (selected) Blue else Color(0xFF8591A6), textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}
@Composable private fun PageTitle(text: String) { Text(text, style = MaterialTheme.typography.titleLarge) }
@Composable private fun Breadcrumb(title: String, back: () -> Unit, description: String = "Back", modifier: Modifier = Modifier, inset: Boolean = true) {
    Row(modifier.then(if (inset) Modifier.padding(horizontal = 18.dp, vertical = 6.dp) else Modifier), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = back, modifier = Modifier.size(36.dp)) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, description, tint = Blue, modifier = Modifier.size(20.dp)) }
        Text(title, style = MaterialTheme.typography.bodySmall, color = Muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}
@Composable private fun SearchBox(value: String, update: (String) -> Unit, global: Boolean) {
    val focus = LocalFocusManager.current
    val interaction = remember { MutableInteractionSource() }
    val focused by interaction.collectIsFocusedAsState()
    BasicTextField(value, update, modifier = Modifier.fillMaxWidth().testTag("pmsv-search")
        .semantics { contentDescription = "Search news updates" }, singleLine = true,
        textStyle = MaterialTheme.typography.bodyMedium.copy(color = Navy), cursorBrush = SolidColor(Blue),
        interactionSource = interaction, keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
        keyboardActions = KeyboardActions(onSearch = { focus.clearFocus() }), decorationBox = { input ->
            Row(Modifier.fillMaxWidth().background(Color.White, CardShape)
                .border(1.dp, if (focused) Blue else Line, CardShape).heightIn(min = 50.dp)
                .padding(start = 14.dp, end = if (value.isEmpty()) 14.dp else 2.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Icon(PmsvIcons.Search, null, tint = Muted, modifier = Modifier.size(20.dp))
                Box(Modifier.weight(1f).padding(vertical = 12.dp)) {
                    if (value.isEmpty()) Text(if (global) "Search all topics, countries, regulators and news…" else "Search this feed by topic, organisation or date…",
                        color = Color(0xFF8895A8), fontSize = 14.sp, lineHeight = 20.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    input()
                }
                if (value.isNotEmpty()) IconButton(onClick = { update("") }) { Icon(Icons.Outlined.Close, "Clear search", modifier = Modifier.size(18.dp)) }
            }
        })
}
@Composable private fun HomeLauncher(entries: List<Destination>, select: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min).testTag("home-tools"), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
        entries.forEach { entry ->
            OutlinedCard(onClick = { select(entry.id) }, modifier = Modifier.weight(1f).fillMaxHeight().heightIn(min = 78.dp), shape = CardShape,
                colors = CardDefaults.outlinedCardColors(containerColor = Color.White), border = BorderStroke(1.dp, Line)) {
                Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(entry.icon, null, tint = entry.tint, modifier = Modifier.size(21.dp))
                    Text(if (entry.id == "licence") "FSSAI\nLicence" else entry.title, fontSize = 13.sp, lineHeight = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
@Composable private fun TopicLauncher(entries: List<Destination>, select: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        entries.chunked(3).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { entry ->
                    Column(Modifier.weight(1f).clickable(role = Role.Button) { select(entry.id) }.padding(horizontal = 2.dp, vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(9.dp)) {
                        Box(Modifier.size(58.dp).background(entry.tint.copy(alpha = 0.09f), RoundedCornerShape(17.dp)), contentAlignment = Alignment.Center) {
                            Icon(entry.icon, null, tint = entry.tint, modifier = Modifier.size(29.dp))
                        }
                        Text(entry.title, fontSize = 14.sp, lineHeight = 19.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
                    }
                }
                repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}
@Composable private fun RegionLauncher(select: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        regions.chunked(2).forEach { row ->
            Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { (id, name) ->
                    OutlinedCard(onClick = { select(id) }, modifier = Modifier.weight(1f).fillMaxHeight()
                        .semantics { contentDescription = name }, shape = RoundedCornerShape(15.dp),
                        colors = CardDefaults.outlinedCardColors(containerColor = Color.White), border = BorderStroke(1.dp, Line)) {
                        Column(Modifier.fillMaxWidth().padding(horizontal = 15.dp, vertical = 20.dp)) {
                            Image(painterResource(regionLogos.getValue(id)), null, Modifier.fillMaxWidth().height(55.dp))
                            Spacer(Modifier.height(16.dp))
                            Text(name.substringBefore(" · "), fontSize = 17.sp, lineHeight = 22.sp, fontWeight = FontWeight.Bold)
                            Text(name.substringAfter(" · "), color = Muted, fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}
@Composable private fun RecentUpdateRow(item: NewsItem, first: Boolean, last: Boolean, open: () -> Unit) {
    Surface(onClick = open, color = Color.White, border = BorderStroke(0.5.dp, Line),
        shape = RoundedCornerShape(topStart = if (first) 12.dp else 0.dp, topEnd = if (first) 12.dp else 0.dp,
            bottomStart = if (last) 12.dp else 0.dp, bottomEnd = if (last) 12.dp else 0.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                val today = LocalDate.now(ZoneId.of("Asia/Kolkata")).toString()
                Text("${item.source} · ${displayDate(item.published)}${if (item.published == today) " · Today" else ""}", color = Muted, fontSize = 12.sp, lineHeight = 17.sp)
                Text(item.title, color = Color(0xFF253756), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
            Icon(PmsvIcons.ArrowUpRight, null, tint = Blue, modifier = Modifier.size(19.dp))
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
                Icon(PmsvIcons.ArrowUpRight, null, tint = Blue, modifier = Modifier.size(20.dp))
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
@Composable private fun NotificationControls(enabled: Boolean, allowed: Boolean, toggle: (Boolean) -> Unit, test: suspend () -> NewsAlertResult, settings: () -> Unit, message: String, setMessage: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var sending by remember { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Daily update alerts", fontWeight = FontWeight.Bold)
        Text(if (enabled && allowed) "Enabled on this device" else "Alerts are off", color = Muted, style = MaterialTheme.typography.bodyMedium)
        Button(onClick = { toggle(!(enabled && allowed)) }, modifier = Modifier.fillMaxWidth(), shape = ButtonShape) { Text(if (enabled && allowed) "Turn off notifications" else "Allow notifications") }
        OutlinedButton(onClick = {
            sending = true
            setMessage("")
            scope.launch {
                try { setMessage(test().message) }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { setMessage("Could not load news. Check your connection and try again.") }
                finally { sending = false }
            }
        }, enabled = !sending, modifier = Modifier.fillMaxWidth(), shape = ButtonShape) {
            Text(if (sending) "Loading headlines…" else "Send news notification")
        }
        Text("Sends the latest available headlines with their publication date.", color = Muted, style = MaterialTheme.typography.bodySmall)
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
