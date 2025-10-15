import { create } from 'zustand'

interface reportStore {
    reports: any[];
    getReports: () => Promise<any>;
    addReports: (report: any) => Promise<any>;

    //Change Report status
    changeReportStatus: (selectedReport: any) => Promise<any>;

}

const useReportStore = create<reportStore>((set, get) => ({
    reports: [],
    getReports: async () => {
        try {
            const res = await fetch(`/api/report/getReport`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await res.json();

            if (!res.ok) {
                return { error: true };
            }

            set({ reports: data?.reports })

            return data;
        } catch (err) {
            console.error(err)
        }
    },
    addReports: async (report) => {
        try {
            const res = await fetch(`/api/report/addReport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            });
            const data = await res.json();

            if (!res.ok) {
                return { error: true };
            }
            return data;
        } catch (err) {
            console.error(err)
        }
    },

    //Change Report status
    changeReportStatus: async (selectedReport) => {
        try {
            const res = await fetch(`/api/report/changeStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({selectedReport})
            });
            const data = await res.json();

            if (!res.ok) {
                return { error: true };
            }
            return data;
        } catch (err) {
            console.error(err)
        }
    }
}));

export default useReportStore;