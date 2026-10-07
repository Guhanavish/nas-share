package com.nas.app

import android.app.Application
import com.nas.app.data.NasDatabase

class NasApplication : Application() {

    lateinit var database: NasDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        database = NasDatabase.create(this)
    }

    companion object {
        lateinit var instance: NasApplication
            private set
    }
}
