import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'quickstart',
    'quickstart_for_ai',
    {
      type: 'category',
      label: 'Hardware guides',
      link: {type: 'doc', id: 'hardware/index'},
      items: [
        'hardware/raspi_1',
        'hardware/raspi_pico_1',
        'hardware/rapi_2_cam',
        'hardware/esp32_1',
        'hardware/m5_timer_cam',
        'hardware/swbot_co2',
      ],
    },
    {
      type: 'category',
      label: 'Sample code',
      link: {type: 'doc', id: 'samplecode/index'},
      items: [
        'samplecode/python_ex1',
        'samplecode/python_ex2',
        'samplecode/esp32_ex1',
        'samplecode/raspi_cam_ex1',
        'samplecode/M5stack_cam_ex1',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api_endpoint/api_reference',
        'api_endpoint/api_image_reference',
      ],
    },
  ],
};

export default sidebars;
