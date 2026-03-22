import Swal from "sweetalert2";

export type ValidationInput = {
    value: string;
    message: string;
};

export function validateInputs(inputs: ValidationInput[]) {
    const errors: string[] = [];

    inputs.forEach((input) => {
        if (!input.value || input.value.trim() === "") {
            errors.push(input.message);
        }
    });

    if (errors.length > 0) {
        Swal.fire({
            icon: "warning",
            title: "Inputan Ada yang Kurang",
            html: `<div style="text-align:left;">
                    ${errors.map((msg) => `• ${msg}`).join("<br>")}
                    </div>
                `,
            confirmButtonText: "Tutup",
        });

        return false;
    }

    return true;
}