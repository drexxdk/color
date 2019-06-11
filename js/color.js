var layoutr = window.layoutr || {};

layoutr.body = document.body;

let themes = [
    {
        name: 'light',
        body: '#f1f1f1',
        grays: [
            "#ffffff",
            "#f8f9fa",
            "#e9ecef",
            "#dee2e6",
            "#ced4da",
            "#adb5bd",
            "#6F7780",
            "#495057",
            "#343a40",
            "#212529",
            "#000000"
        ],
        colors: [
            {
                name: "primary",
                hex: "#0072ED"
            },
            {
                name: "secondary",
                hex: "#6F7780"
            },
            {
                name: "success",
                hex: "#218838"
            },
            {
                name: "info",
                hex: "#138294"
            },
            {
                name: "warning",
                hex: "#BE5A06"
            },
            {
                name: "danger",
                hex: "#dc3545"
            },
            {
                name: "light",
                hex: "#f8f9fa"
            },
            {
                name: "dark",
                hex: "#343a40"
            }
        ]
    }
];

let alpha = (rgb, percent) => {
    percent = parseInt(255 * percent / 100);

    let fix = color => {
        color = color + percent;
        if (color > 255) {
            color = 255;
        } else if (color < 0) {
            color = 0;
        }
        return color;
    };

    return [
        fix(rgb[0]),
        fix(rgb[1]),
        fix(rgb[2])
    ];
};

let yiq = rgb => {
    return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 145 ? [0, 0, 0] : [255, 255, 255];
};

let lighten = (rgb, percent) => {
    return alpha(rgb, percent);
};

let darken = (rgb, percent) => {
    return alpha(rgb, -percent);
};

let channelMix = (channel1, channel2, amount) => {
    channel1 = channel1 * amount;
    channel2 = channel2 * (1 - amount);
    return parseInt(channel1 + channel2);
};

let mix = (rgb1, rgb2, amount) => {
    amount = amount > 1 ? amount / 100 : amount;
    return [
        channelMix(rgb1[0], rgb2[0], amount),
        channelMix(rgb1[1], rgb2[1], amount),
        channelMix(rgb1[2], rgb2[2], amount)
    ];
};

let saturate = (color, saturation) => {
    saturation = saturation / 100;
    var gray = color[0] * 0.3086 + color[1] * 0.6094 + color[2] * 0.0820;

    color[0] = Math.round(color[0] * saturation + gray * (1 - saturation));
    color[1] = Math.round(color[1] * saturation + gray * (1 - saturation));
    color[2] = Math.round(color[2] * saturation + gray * (1 - saturation));

    return color;
};

let hexToRgb = hex => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
};

let setupTheme = (theme) => {
    theme = themes[theme];
    theme.body = hexToRgb(theme.body);
    for (let [i, gray] of theme.grays.entries()) {
        layoutr.body.style.setProperty(`--gray-${i * 10}`, `${hexToRgb(gray)}`);
    }

    for (color of theme.colors) {
        let defaultBackground = hexToRgb(color.hex),
            defaultForeground = yiq(defaultBackground);
        layoutr.body.style.setProperty(`--${color.name}-background`, `${defaultBackground}`);
        layoutr.body.style.setProperty(`--${color.name}-background-gradient`, `${mix(theme.body, defaultBackground, 15)}`);
        layoutr.body.style.setProperty(`--${color.name}-text`, `${defaultForeground}`);
        layoutr.body.style.setProperty(`--${color.name}-border`, `${darken(defaultBackground, 10)}`);

        let hoverBackground = darken(defaultBackground, 10),
            hoverForeground = yiq(hoverBackground);
        layoutr.body.style.setProperty(`--${color.name}-hover-background`, `${hoverBackground}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-background-gradient`, `${mix(theme.body, hoverBackground, 15)}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-text`, `${hoverForeground}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-border`, `${darken(hoverBackground, 10)}`);
        
        let softBackground = mix(defaultBackground, [255,255,255], 25),
            softForeground = yiq(softBackground);
        layoutr.body.style.setProperty(`--${color.name}-soft-background`, `${softBackground}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-background-gradient`, `${mix(theme.body, softBackground, 15)}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-text`, `${softForeground}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-border`, `${darken(softBackground, 10)}`);
    }
};

setupTheme(0);