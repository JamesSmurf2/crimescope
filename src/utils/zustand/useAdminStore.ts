import { create } from 'zustand'

interface reportStore {
    getAllAdmin: () => Promise<any>
    deleteAdmin: (id: string) => Promise<any>
    getLogsAdmin: () => Promise<any>
    changeAdminEnableTwoFa: (adminId: string, currentStatus: boolean) => Promise<any>
}

const useAdminStore = create<reportStore>((set, get) => ({
    getAllAdmin: async () => {
        try {
            let res = await fetch('/api/admin/getAllAdmin')
            if (!res.ok) return { error: 'User already exist or error.' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    deleteAdmin: async (id: string) => {
        try {
            let res = await fetch('/api/admin/deleteAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })
            if (!res.ok) return { error: 'User already exist or error.' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    getLogsAdmin: async () => {
        try {
            let res = await fetch('/api/admin/getLogsAdmin')
            if (!res.ok) return { error: 'User already exist or error.' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    changeAdminEnableTwoFa: async (adminId: string, currentStatus: boolean) => {

        console.log("Nakakarating ba dito")
        try {
            let res = await fetch('/api/admin/changeAdminEnableTwoFa', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ adminId, currentStatus })
            })
            if (!res.ok) return { error: 'User already exist or error.' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    }
}));

export default useAdminStore;