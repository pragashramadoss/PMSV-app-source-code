package com.pmsvgroup.foodsafety;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.androidbrowserhelper.trusted.LauncherActivity;

/**
 * PMSV launcher.
 *
 * Android 13+ requires the native POST_NOTIFICATIONS runtime permission.
 * TWA notification delegation makes the website notification permission
 * depend on this app-level permission, so request it once before the TWA
 * starts. The normal Android Browser Helper delegated permission activity
 * remains declared as well for browser-initiated requests.
 */
public class PmsvLauncherActivity extends LauncherActivity {
    private static final int REQUEST_POST_NOTIFICATIONS = 1001;
    private static final String PREFS = "pmsv_native_permissions";
    private static final String KEY_REQUESTED = "post_notifications_requested";
    private boolean waitingForNotificationPermission;

    private boolean needsInitialNotificationRequest() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return false;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED) return false;
        SharedPreferences prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return !prefs.getBoolean(KEY_REQUESTED, false);
    }

    @Override
    protected boolean shouldLaunchImmediately() {
        return !needsInitialNotificationRequest();
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (needsInitialNotificationRequest()) {
            getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    .edit()
                    .putBoolean(KEY_REQUESTED, true)
                    .apply();

            waitingForNotificationPermission = true;
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    REQUEST_POST_NOTIFICATIONS
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            @NonNull String[] permissions,
            @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_POST_NOTIFICATIONS && waitingForNotificationPermission) {
            waitingForNotificationPermission = false;
            if (!isFinishing()) launchTwa();
        }
    }
}
