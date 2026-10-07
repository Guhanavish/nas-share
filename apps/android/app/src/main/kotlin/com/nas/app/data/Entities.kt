package com.nas.app.data

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

// =============================================================================
// Trusted Device
// =============================================================================
@Entity(tableName = "trusted_devices")
data class TrustedDeviceEntity(
    @PrimaryKey
    @ColumnInfo(name = "device_id") val deviceId: String,
    @ColumnInfo(name = "device_name") val deviceName: String,
    @ColumnInfo(name = "pubkey") val pubkey: String,
    @ColumnInfo(name = "pinned_at") val pinnedAt: Long,
    @ColumnInfo(name = "last_seen") val lastSeen: Long? = null,
    @ColumnInfo(name = "is_revoked") val isRevoked: Boolean = false
)

@Dao
interface TrustedDeviceDao {
    @Query("SELECT * FROM trusted_devices WHERE is_revoked = 0 ORDER BY last_seen DESC")
    fun getAllTrusted(): Flow<List<TrustedDeviceEntity>>

    @Query("SELECT * FROM trusted_devices ORDER BY pinned_at DESC")
    fun getAll(): Flow<List<TrustedDeviceEntity>>

    @Query("SELECT * FROM trusted_devices WHERE device_id = :deviceId")
    suspend fun getById(deviceId: String): TrustedDeviceEntity?

    @Query("SELECT * FROM trusted_devices WHERE pubkey = :pubkey AND is_revoked = 0")
    suspend fun getByPubkey(pubkey: String): TrustedDeviceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(device: TrustedDeviceEntity)

    @Update
    suspend fun update(device: TrustedDeviceEntity)

    @Query("UPDATE trusted_devices SET is_revoked = 1 WHERE device_id = :deviceId")
    suspend fun revoke(deviceId: String)

    @Query("UPDATE trusted_devices SET last_seen = :timestamp WHERE device_id = :deviceId")
    suspend fun updateLastSeen(deviceId: String, timestamp: Long)

    @Delete
    suspend fun delete(device: TrustedDeviceEntity)

    @Query("DELETE FROM trusted_devices")
    suspend fun deleteAll()
}

// =============================================================================
// Shared Folder
// =============================================================================
@Entity(tableName = "shared_folders")
data class SharedFolderEntity(
    @PrimaryKey
    @ColumnInfo(name = "id") val id: String,
    @ColumnInfo(name = "path") val path: String,
    @ColumnInfo(name = "label") val label: String,
    @ColumnInfo(name = "acl") val acl: String = "READ", // READ or READWRITE
    @ColumnInfo(name = "enabled") val enabled: Boolean = true
)

@Dao
interface SharedFolderDao {
    @Query("SELECT * FROM shared_folders ORDER BY label ASC")
    fun getAll(): Flow<List<SharedFolderEntity>>

    @Query("SELECT * FROM shared_folders WHERE enabled = 1")
    suspend fun getEnabled(): List<SharedFolderEntity>

    @Query("SELECT * FROM shared_folders WHERE id = :id")
    suspend fun getById(id: String): SharedFolderEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(folder: SharedFolderEntity)

    @Update
    suspend fun update(folder: SharedFolderEntity)

    @Query("UPDATE shared_folders SET enabled = :enabled WHERE id = :id")
    suspend fun setEnabled(id: String, enabled: Boolean)

    @Delete
    suspend fun delete(folder: SharedFolderEntity)

    @Query("DELETE FROM shared_folders")
    suspend fun deleteAll()
}
