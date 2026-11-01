package com.nas.app

import android.app.Application
import android.os.Environment
import com.nas.app.data.NasDatabase
import com.nas.app.data.SharedFolderEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

class NasApplication : Application() {

    lateinit var database: NasDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        database = NasDatabase.create(this)

        // Auto-seed default shared folder if none exists
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val dao = database.sharedFolderDao()
                val existing = dao.getEnabled()
                if (existing.isEmpty()) {
                    val publicDownloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    val shareDir = if (publicDownloads != null && (publicDownloads.exists() || publicDownloads.mkdirs())) {
                        publicDownloads
                    } else {
                        File(getExternalFilesDir(null), "Shared").apply { mkdirs() }
                    }
                    dao.insert(
                        SharedFolderEntity(
                            id = "default_downloads",
                            path = shareDir.absolutePath,
                            label = "Downloads",
                            acl = "READWRITE",
                            enabled = true
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    companion object {
        lateinit var instance: NasApplication
            private set
    }
}
