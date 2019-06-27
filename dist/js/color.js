var layoutr = window.layoutr || {};

layoutr.body = document.body;

let themes = [
    {
        name: 'light',
        body: '#f1f1f1',
        text: {
            light: '#ffffff',
            dark: '#212529'
        },
        link: '#0072ED',
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
    },
    {
        name: 'dark',
        body: '#0d0d0d',
        text: {
            light: '#ffffff',
            dark: '#212529'
        },
        link: '#0072ED',
        grays: [
            "#000000",
            "#21201F",
            "#302D2A",
            "#3B3733",
            "#4B453F",
            "#6C645C",
            "#AAA299",
            "#D0C9C2",
            "#E5DFD9",
            "#F8F4F0",
            "#ffffff"
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

let yiq = (rgb, text) => {
    return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 128 ? text.dark : text.light;
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

let luminance = color => {
    var a = color.map((v) => {
        v /= 255;
        return v <= .03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return (a[0] * .2126 + a[1] * .7152 + a[2] * .0722);
};

let contrast = (rgb1, rgb2) => {
    let luma1 = (luminance(rgb1) + 0.05),
        luma2 = (luminance(rgb2) + 0.05),
        ratio = luma1 / luma2;

    if (luma1 < luma2) {
        ratio = 1 / ratio;
    }

    return ratio;
}

let textContrast = (color, bgcolor, basedOn, text) => {
    let threshold = 4.5; // 4.5 = WCAG AA,7= WCAG AAA
    let defaultRatio = contrast(bgcolor, color);
    if (defaultRatio > threshold) {
        return color;
    }

    for (let i = 1; i <= 10; i++) {
        let percentage = i * 10;
        let lighter = lighten(color, percentage);
        let darker = darken(color, percentage);
        let darkerRatio = contrast(bgcolor, darker);
        let lighterRatio = contrast(bgcolor, lighter);

        if (lighterRatio > darkerRatio && lighterRatio > threshold && (!basedOn || basedOn === text.light)) {
            return lighter;
        }

        if (darkerRatio > lighterRatio && darkerRatio > threshold && (!basedOn || basedOn === text.dark)) {
            return darker;
        }
    }
    return yiq(color, text);
};

let setupTheme = (themeName) => {
    let theme = themes.filter(element => {
        return element.name === themeName;
    });
    if (theme.length) {
        theme = { ...theme[0] }; // ... clones the object, so it doesn't effect the original theme
    } else {
        console.warn('theme not found');
        return;
    }
    theme.body = hexToRgb(theme.body);
    theme.link = hexToRgb(theme.link);
    theme.text = {
        light: hexToRgb(theme.text.light),
        dark: hexToRgb(theme.text.dark)
    };

    layoutr.body.style.setProperty(`--body`, `${theme.body}`);
    layoutr.body.style.setProperty(`--link`, `${theme.link}`);
    layoutr.body.style.setProperty(`--text-light`, `${theme.text.light}`);
    layoutr.body.style.setProperty(`--text-dark`, `${theme.text.dark}`);
    layoutr.body.style.setProperty(`--text`, `${yiq(theme.body, theme.text)}`);

    for (let [i, gray] of theme.grays.entries()) {
        layoutr.body.style.setProperty(`--gray-${i * 10}`, `${hexToRgb(gray)}`);
    }

    for (color of theme.colors) {
        let defaultBackground = hexToRgb(color.hex),
            defaultForeground = yiq(defaultBackground, theme.text);
        layoutr.body.style.setProperty(`--${color.name}-background`, `${defaultBackground}`);
        layoutr.body.style.setProperty(`--${color.name}-background-gradient`, `${mix(theme.body, defaultBackground, 15)}`);
        layoutr.body.style.setProperty(`--${color.name}-text`, `${defaultForeground}`);
        layoutr.body.style.setProperty(`--${color.name}-border`, `${darken(defaultBackground, 10)}`);
        layoutr.body.style.setProperty(`--${color.name}-link`, `${textContrast(theme.link, defaultBackground, defaultForeground, theme.text)}`);


        let hoverBackground = darken(defaultBackground, 10),
            hoverForeground = yiq(hoverBackground, theme.text);
        layoutr.body.style.setProperty(`--${color.name}-hover-background`, `${hoverBackground}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-background-gradient`, `${mix(theme.body, hoverBackground, 15)}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-text`, `${hoverForeground}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-border`, `${darken(hoverBackground, 10)}`);
        layoutr.body.style.setProperty(`--${color.name}-hover-link`, `${textContrast(theme.link, hoverBackground, hoverForeground, theme.text)}`);

        let softBackground = mix(defaultBackground, [255, 255, 255], 25),
            softForeground = yiq(softBackground, theme.text);
        layoutr.body.style.setProperty(`--${color.name}-soft-background`, `${softBackground}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-background-gradient`, `${mix(theme.body, softBackground, 15)}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-text`, `${softForeground}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-border`, `${darken(softBackground, 10)}`);
        layoutr.body.style.setProperty(`--${color.name}-soft-link`, `${textContrast(theme.link, softBackground, softForeground, theme.text)}`);
    }
};

setupTheme('light');

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("theme-selector").addEventListener("change", function () {
        setupTheme(this.value);
    });
}, false);