var layoutr = window.layoutr || {};

layoutr.body = document.body;


let lightTheme = {
    background: {
        hover: -15,
        soft: 25
    },
    border: -10,
    gradient: 15,
    name: 'light',
    body: '#f1f1f1',
    overlay: {
        layout: {
            light: '#666666',
            dark: '#999999'
        },
        component: {
            light: '#999999',
            dark: '#666666'
        }
    },
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
            hex: () => { return "#0072ED"; }
        },
        {
            name: "secondary",
            hex: () => { return lightTheme.grays[6]; }
        },
        {
            name: "success",
            hex: () => { return "#218838"; }
        },
        {
            name: "info",
            hex: () => { return "#138294"; }
        },
        {
            name: "warning",
            hex: () => { return "#BE5A06"; }
        },
        {
            name: "danger",
            hex: () => { return "#dc3545"; }
        },
        {
            name: "light",
            hex: () => { return lightTheme.grays[2]; }
        },
        {
            name: "dark",
            hex: () => { return lightTheme.grays[8]; }
        }
    ]
},
    darkTheme =
    {
        background: {
            hover: 15,
            soft: 50
        },
        border: 10,
        gradient: 15,
        name: 'dark',
        body: '#0d0d0d',
        overlay: {
            layout: {
                light: '#999999',
                dark: '#666666'
            },
            component: {
                light: '#666666',
                dark: '#999999'
            }
        },
        text: {
            light: '#ffffff',
            dark: '#212529'
        },
        link: '#0072ED',
        grays: [
            "#000000",
            "#212529",
            "#343a40",
            "#495057",
            "#6F7780",
            "#adb5bd",
            "#ced4da",
            "#dee2e6",
            "#e9ecef",
            "#f8f9fa",
            "#ffffff"
        ],
        colors: [
            {
                name: "primary",
                hex: () => { return "#0072ED"; }
            },
            {
                name: "secondary",
                hex: () => { return darkTheme.grays[6]; }
            },
            {
                name: "success",
                hex: () => { return "#218838"; }
            },
            {
                name: "info",
                hex: () => { return "#138294"; }
            },
            {
                name: "warning",
                hex: () => { return "#BE5A06"; }
            },
            {
                name: "danger",
                hex: () => { return "#dc3545"; }
            },
            {
                name: "light",
                hex: () => { return darkTheme.grays[2]; }
            },
            {
                name: "dark",
                hex: () => { return darkTheme.grays[8]; }
            }
        ]
    },
    themes = [
        lightTheme,
        darkTheme
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
    let result = channel1 + channel2;
    if (result > 255) {
        result = 255;
    } else if (result < 0) {
        result = 0;
    }
    return parseInt(result);
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
    return a[0] * .2126 + a[1] * .7152 + a[2] * .0722;
};

let contrast = (rgb1, rgb2) => {
    let luma1 = luminance(rgb1) + 0.05,
        luma2 = luminance(rgb2) + 0.05,
        ratio = luma1 / luma2;

    if (luma1 < luma2) {
        ratio = 1 / ratio;
    }

    return ratio;
};

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
        let defaultBackground = hexToRgb(color.hex()),
            defaultHoverBackground = alpha(defaultBackground, theme.background.hover),
            softBackground = mix(defaultBackground, hexToRgb(theme.grays[0]), theme.background.soft),
            softHoverBackground = alpha(softBackground, theme.background.hover);

        let colors = [
            {
                name: '',
                background: defaultBackground
            },
            {
                name: '-hover',
                background: defaultHoverBackground
            },
            {
                name: '-soft',
                background: softBackground
            },
            {
                name: '-soft-hover',
                background: softHoverBackground
            }
        ];

        for (let item of colors) {
            let foreground = yiq(item.background, theme.text);
            layoutr.body.style.setProperty(`--${color.name}${item.name}-background`, `${item.background}`);
            layoutr.body.style.setProperty(`--${color.name}${item.name}-background-gradient`, `${mix(theme.body, item.background, theme.gradient)}`);
            layoutr.body.style.setProperty(`--${color.name}${item.name}-text`, `${foreground}`);
            layoutr.body.style.setProperty(`--${color.name}${item.name}-border`, `${alpha(item.background, theme.border)}`);
            layoutr.body.style.setProperty(`--${color.name}${item.name}-link`, `${textContrast(theme.link, item.background, foreground, theme.text)}`);
        }
    }
};

setupTheme('light');

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("theme-selector").addEventListener("change", function () {
        setupTheme(this.value);
    });
}, false);