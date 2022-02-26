import {getUserData} from "./Fetcher";

export const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export const convertTimestampToDayWeekMonthMin = (timestamp, upperCaseLetters = false, agoTill = "", options = {timeZone: "Asia/Kolkata"}) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInMins = Math.round(diff / 60000);
    const diffInHours = Math.round(diff / 3600000);
    const diffInDays = Math.round(diff / 86400000);
    const diffInWeeks = Math.round(diff / 604800000);
    const diffInMonths = Math.round(diff / 2629800000);

    if (diffInMins <= 1) {
        return upperCaseLetters ? "JUST NOW" : "Just now";
    } else if (diffInMins > 1 && diffInMins < 60) {
        if (agoTill === "m") return date.toLocaleString("en-US", options);
        return diffInMins + (upperCaseLetters ? " MINUTES AGO" : "m ago");
    } else if (diffInHours < 24) {
        if (agoTill === "h") return date.toLocaleString("en-US", options);
        return diffInHours + (upperCaseLetters ? " HOURS AGO" : "h ago");
    } else if (diffInDays < 7) {
        if (agoTill === "d") return date.toLocaleString("en-US", options);
        return diffInDays + (upperCaseLetters ? " DAYS AGO" : "d ago");
    } else if (diffInWeeks < 4) {
        if (agoTill === "w") return date.toLocaleString("en-US", options);
        return diffInWeeks + (upperCaseLetters ? " WEEKS AGO" : "w ago");
    } else {
        return date.toLocaleString("en-US", options);
    }
}

export const dumbModificationForUsuablePost = (posts) => {
    return new Promise(async (resolve, reject) => {
        var finalData = []
        if (!posts.length) {
            resolve([])
        }
        for (let i = 0; i < posts.length; i++) {
            var user = await getUserData(posts[i].owner)

            finalData.push({
                post: posts[i],
                user: user
            })

            if (i === posts.length - 1) {
                resolve(finalData)
            }
        }
    })
}

export const sortPostForHomePage = (posts) => {
    return new Promise(async (resolve, reject) => {
        if (!posts.length) {
            resolve([])
        }
        const likes = posts.map(data => data.post.likes.length)
        const averageLikes = likes.reduce((a, b) => a + b, 0) / likes.length
        let finalData = posts.map(data => {
            let interest = 0;
            const ago = Math.round(((new Date()).getTime() - data.post.timestamp.seconds*1000) / 86400000);

            if (ago < 7) {
                interest += ago > 0 ? 4 * ago : 51;
            }
            if (data.post.likes.length) {
                interest += Math.min(50, data.post.likes.length * 100 / averageLikes)
            }
            return {
                post: data.post,
                user: data.user,
                interest: interest
            }
        })
        finalData.sort((a, b) => {
            return b.interest - a.interest
        })
        resolve(finalData)
    })
}
