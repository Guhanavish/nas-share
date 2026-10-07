package com.nas.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [TrustedDeviceEntity::class, SharedFolderEntity::class],
    version = 1,
    exportSchema = false
)
abstract class NasDatabase : RoomDatabase() {

    abstract fun trustedDeviceDao(): TrustedDeviceDao
    abstract fun sharedFolderDao(): SharedFolderDao

    companion object {
        fun create(context: Context): NasDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                NasDatabase::class.java,
                "nas_share.db"
            ).fallbackToDestructiveMigration().build()
        }
    }
}
