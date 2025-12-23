
import { NextResponse } from 'next/server';
import { registerTenant } from '@/lib/actions';
import { dbAdapter } from '@/lib/db-adapter';
import crypto from 'crypto';

export async function GET() {
    try {
        console.log("Starting Debug Activation...");

        // 1. Generate a fake license key directly (Bypassing generateLicense auth)
        const key = "TEST-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        const licenseData = {
            id: crypto.randomUUID(),
            key,
            duration_days: 30, // 30 days trial
            status: 'active',
            created_at: new Date().toISOString()
        };

        // Use dbAdapter directly
        await dbAdapter.collection('licenses').add(licenseData);

        console.log("Created License Key:", key);

        // 2. Register Tenant
        const managerData = {
            name: "Test Company " + Math.floor(Math.random() * 1000),
            username: `testadmin_${Date.now()}@example.com`,
            password: "Password123!",
            phone: "0910000000"
        };

        const result = await registerTenant(managerData, key);

        return NextResponse.json({
            step1_license: {
                key,
                data: licenseData,
                status: "Created directly in DB"
            },
            step2_registration: result,
            manager_data: managerData
        });

    } catch (error: any) {
        console.error("Debug Activation Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
